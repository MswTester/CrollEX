import { useEffect, useRef } from "react";

export function HtmlViewer({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const shadow = ref.current.shadowRoot || ref.current.attachShadow({ mode: "open" });
    shadow.innerHTML = html || "";
  }, [html]);

  return <div ref={ref} className="w-full border rounded-md min-h-[200px]" />;
}
