import { json, type ActionFunctionArgs } from "@remix-run/node";
import { JSDOM } from "jsdom";
import { parse } from "acorn";
import * as walk from "acorn-walk";

function extractEvents(code: string) {
  const events: string[] = [];
  try {
    const ast = parse(code, { ecmaVersion: "latest", sourceType: "script" });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    walk.simple(ast, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      CallExpression(node: any) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "addEventListener" &&
          node.arguments.length &&
          node.arguments[0].type === "Literal"
        ) {
          events.push(String(node.arguments[0].value));
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      AssignmentExpression(node: any) {
        if (
          node.left.type === "MemberExpression" &&
          node.left.property.type === "Identifier" &&
          node.left.property.name.startsWith("on")
        ) {
          events.push(node.left.property.name.slice(2));
        }
      },
    });
  } catch {
    // ignore parse errors
  }
  return events;
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { url, userAgent } = await request.json();
    if (!url) {
      return json({ error: "Missing url" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: userAgent ? { "User-Agent": userAgent } : undefined,
    });
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const { document } = dom.window;
    const inlineEvents: { selector: string; event: string; code: string }[] = [];
    const selectorFor = (el: Element) => {
      const id = el.getAttribute("id");
      if (id) return `#${id}`;
      const cls = el.getAttribute("class");
      if (cls) return `${el.tagName.toLowerCase()}.${cls.split(/\s+/).join(".")}`;
      return el.tagName.toLowerCase();
    };
    document.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name.startsWith("on")) {
          inlineEvents.push({
            selector: selectorFor(el),
            event: attr.name.slice(2),
            code: attr.value,
          });
        }
      });
    });
    const scripts = await Promise.all(
      Array.from(document.querySelectorAll("script"))
        .map((el) => el as HTMLScriptElement)
        .map(async (el) => {
        if (el.src) {
          try {
            const scriptRes = await fetch(el.src, {
              headers: userAgent ? { "User-Agent": userAgent } : undefined,
            });
            const text = await scriptRes.text();
            return { url: el.src, events: extractEvents(text) };
          } catch {
            return { url: el.src, events: [] };
          }
        }
        return { url: null, events: extractEvents(el.textContent || "") };
      })
    );

    return json({ html, scripts, inlineEvents });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ error: message }, { status: 500 });
  }
}
