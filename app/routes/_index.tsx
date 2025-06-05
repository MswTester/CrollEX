import { useEffect, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { ResponseViewer, type ResponseData } from "~/components/ResponseViewer";
import { HtmlAnalysis } from "~/components/HtmlAnalysis";
import { ScriptAnalysis } from "~/components/ScriptAnalysis";
import { Alert } from "~/components/ui/alert";

export const meta: MetaFunction = () => [{ title: "HTTP Client" }];


function parseHeaders(text: string) {
  const lines = text.split(/\r?\n/);
  const headers: Record<string, string> = {};
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) headers[key.trim()] = rest.join(":").trim();
  }
  return headers;
}

function parseQuery(text: string) {
  const params = new URLSearchParams();
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length) params.append(key.trim(), rest.join(":").trim());
  }
  return params.toString();
}

export default function Index() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [useUA, setUseUA] = useState(true);
  const [query, setQuery] = useState("");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<ResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<
    {
      html: string;
      scripts: { url: string | null; events: string[] }[];
      inlineEvents: { selector: string; event: string; code: string }[];
    } | null
  >(null);

  useEffect(() => {
    setUserAgent(navigator.userAgent);
  }, []);

  const send = async () => {
    setError(null);
    setResponse(null);
    setAnalysis(null);
    let target = url;
    const q = parseQuery(query);
    if (q) {
      target = target.includes("?") ? `${target}&${q}` : `${target}?${q}`;
    }
    const res = await fetch("/api/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method,
        url: target,
        headers: {
          ...parseHeaders(headers),
          ...(useUA ? { "User-Agent": userAgent } : {}),
        },
        body,
      }),
    });
    const data = (await res.json()) as ResponseData;
    if (data.error) {
      setError(data.error);
      return;
    }
    setResponse(data);
  };

  const analyze = async () => {
    setError(null);
    setAnalysis(null);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, userAgent: useUA ? userAgent : undefined }),
    });
    const data = await res.json();
    setAnalysis(data.error ? null : data);
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex items-end space-x-2">
        <select
          className="h-10 rounded-md border border-input bg-background px-2"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          {[
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "HEAD",
          ].map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <Input
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={send}>Send</Button>
        <Button onClick={analyze} variant="secondary">Analyze</Button>
      </div>
      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={useUA}
            onChange={(e) => setUseUA(e.target.checked)}
          />
          <span className="text-sm">Use my User Agent</span>
        </label>
        <Input
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="headers" className="font-medium">Headers</label>
          <Textarea
            id="headers"
            className="min-h-[120px]"
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
          />
          <div className="space-y-1">
            <label htmlFor="query" className="font-medium">Query</label>
            <Textarea
              id="query"
              className="min-h-[80px]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {method !== "GET" && method !== "HEAD" && (
            <div className="space-y-1">
              <label htmlFor="body" className="font-medium">Body</label>
              <Textarea
                id="body"
                className="min-h-[120px]"
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
          )}
        </div>
        {error && (
          <Alert className="col-span-2">{error}</Alert>
        )}
        {response && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Status: {response.status} {response.statusText}
            </div>
            <ResponseViewer response={response} />
            <details className="border rounded-md p-2">
              <summary className="cursor-pointer">Headers</summary>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(response.headers, null, 2)}
              </pre>
            </details>
            {response.contentType?.includes("text/html") && (
              <HtmlAnalysis html={response.body} baseUrl={url} />
            )}
          </div>
        )}
        {analysis && !response && (
          <div className="space-y-2 col-span-2">
            <ScriptAnalysis
              scripts={analysis.scripts}
              inlineEvents={analysis.inlineEvents}
            />
          </div>
        )}
      </div>
    </div>
  );
}
