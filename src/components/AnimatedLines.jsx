import { useState, useEffect } from "react";

/**
 * Reveals `lines` one at a time with a configurable delay.
 * Each line: { text: string, className?: string }
 */
export default function AnimatedLines({ lines, stepMs = 380 }) {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (count >= lines.length) return;
    const t = setTimeout(() => setCount((c) => c + 1), stepMs);
    return () => clearTimeout(t);
  }, [count, lines.length, stepMs]);

  return (
    <div className="space-y-0.5 text-xs font-mono">
      {lines.slice(0, count).map((line, i) => (
        <div key={i} className={line.className || "text-[#a8b8c4]"}>
          {line.text}
        </div>
      ))}
    </div>
  );
}
