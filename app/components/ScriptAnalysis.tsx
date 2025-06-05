interface ScriptInfo {
  url: string | null;
  events: string[];
}

interface InlineInfo {
  selector: string;
  event: string;
  code: string;
}

export function ScriptAnalysis({
  scripts,
  inlineEvents,
}: {
  scripts: ScriptInfo[];
  inlineEvents: InlineInfo[];
}) {
  if (!scripts.length && !inlineEvents.length) return null;
  return (
    <div className="space-y-4">
      {scripts.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Scripts</h3>
          <ul className="space-y-2">
            {scripts.map((s, i) => (
              <li key={s.url || i} className="space-y-1">
                <div className="text-sm font-medium">
                  {s.url ? s.url : "inline script"}
                </div>
                {s.events.length ? (
                  <ul className="ml-4 list-disc space-y-1">
                    {s.events.map((e, idx) => (
                      <li key={idx} className="text-sm">
                        {e}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-muted-foreground">no events</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {inlineEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Inline Event Handlers</h3>
          <ul className="space-y-2">
            {inlineEvents.map((ev, i) => (
              <li key={i} className="space-y-1">
                <div className="text-sm font-medium">
                  {ev.selector} - {ev.event}
                </div>
                <pre className="ml-4 whitespace-pre-wrap rounded-md border p-2 text-sm">
                  {ev.code}
                </pre>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
