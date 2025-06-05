import { useEffect, useState } from "react";
import { ResponseViewer, ResponseData } from "./ResponseViewer";

interface Resource {
  url: string;
  content?: ResponseData;
}

export function HtmlAnalysis({ html, baseUrl }: { html: string; baseUrl: string }) {
  const [resources, setResources] = useState<Resource[]>([]);

  useEffect(() => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const srcs = [
      ...Array.from(doc.querySelectorAll("script[src]"), (e) => (e as HTMLScriptElement).src),
      ...Array.from(doc.querySelectorAll("link[rel=stylesheet]"), (e) => (e as HTMLLinkElement).href),
    ];
    const resolved = srcs.map((s) => new URL(s, baseUrl).href);
    setResources(resolved.map((url) => ({ url })));
  }, [html, baseUrl]);

  const view = async (url: string) => {
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: "GET", url }),
    });
    const data = (await res.json()) as ResponseData;
    setResources((r) => r.map((it) => (it.url === url ? { ...it, content: data } : it)));
  };

  if (!resources.length) return null;

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Resources</h3>
      <ul className="space-y-2">
        {resources.map((r) => (
          <li key={r.url} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm">{r.url}</span>
              <button
                className="text-blue-600 underline"
                onClick={() => view(r.url)}
              >
                View
              </button>
            </div>
            {r.content && (
              <div className="border rounded-md p-2">
                <ResponseViewer response={r.content} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
