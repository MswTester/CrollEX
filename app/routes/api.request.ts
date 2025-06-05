import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { method = "GET", url, headers = {}, body } = await request.json();
    if (!url) {
      return json({ error: "Missing url" }, { status: 400 });
    }

    const response = await fetch(url, {
      method,
      headers,
      body: method === "GET" || method === "HEAD" ? undefined : body,
    });

    const contentType = response.headers.get("content-type");
    let bodyText: string;
    let isBase64 = false;

    if (contentType && /^text|application\/json/.test(contentType)) {
      bodyText = await response.text();
    } else {
      const buffer = Buffer.from(await response.arrayBuffer());
      bodyText = buffer.toString("base64");
      isBase64 = true;
    }

    return json(
      {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: bodyText,
        contentType,
        isBase64,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return json({ error: message }, { status: 500 });
  }
}
