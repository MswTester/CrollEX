import { useEffect, useState } from "react";
import { HtmlViewer } from "./HtmlViewer";

/* eslint-disable jsx-a11y/media-has-caption */

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  contentType: string | null;
  error?: string;
  isBase64?: boolean;
}

export function ResponseViewer({ response }: { response: ResponseData }) {
  const { contentType, body, isBase64 } = response;
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isBase64) {
      const binary = Uint8Array.from(atob(body), (c) => c.charCodeAt(0));
      const blob = new Blob([binary], { type: contentType || "application/octet-stream" });
      const objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setUrl(null);
    return;
  }, [body, contentType, isBase64]);

  if (contentType?.includes("text/html")) {
    return <HtmlViewer html={body} />;
  }

  if (contentType?.includes("application/json")) {
    try {
      const json = JSON.parse(body);
      return (
        <pre className="whitespace-pre-wrap rounded-md border p-2 min-h-[200px]">
          {JSON.stringify(json, null, 2)}
        </pre>
      );
    } catch {
      return <pre className="whitespace-pre-wrap">{body}</pre>;
    }
  }

  if (contentType?.startsWith("text/")) {
    return (
      <pre className="whitespace-pre-wrap rounded-md border p-2 min-h-[200px]">
        {body}
      </pre>
    );
  }

  if (contentType?.startsWith("image/") && url) {
    return (
      <div className="space-y-2">
        <img src={url} alt="response" className="max-w-full" />
        <a
          href={url}
          download
          className="text-blue-600 underline"
        >
          Download
        </a>
      </div>
    );
  }

  if (contentType?.startsWith("video/") && url) {
    return (
      <div className="space-y-2">
        <video src={url} controls className="max-w-full" />
        <a
          href={url}
          download
          className="text-blue-600 underline"
        >
          Download
        </a>
      </div>
    );
  }

  if (url) {
    return (
      <a href={url} download className="text-blue-600 underline">
        Download file
      </a>
    );
  }

  return <pre className="whitespace-pre-wrap">{body}</pre>;
}
