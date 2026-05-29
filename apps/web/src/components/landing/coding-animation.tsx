"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const codeLines = [
  "def solve(nums, target):",
  "    seen = {}",
  "    for i, n in enumerate(nums):",
  "        if target - n in seen:",
  "            return [seen[target-n], i]",
  "        seen[n] = i",
  "    return []",
];

export function CodingAnimation() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleLines((v) => (v >= codeLines.length ? 0 : v + 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-1 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500/80" />
        <div className="h-3 w-3 rounded-full bg-amber-500/80" />
        <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        <span className="ml-2 text-xs text-muted-foreground">two_sum.py</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="ml-auto text-xs text-emerald-500"
        >
          ● Running...
        </motion.span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        {codeLines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < visibleLines ? 1 : 0.2, x: 0 }}
            className={i < visibleLines ? "text-foreground" : "text-muted-foreground/40"}
          >
            <span className="mr-4 select-none text-muted-foreground/50">{i + 1}</span>
            <span className={line.includes("return") ? "text-purple-400" : line.includes("def") ? "text-blue-400" : ""}>
              {line}
            </span>
          </motion.div>
        ))}
      </pre>
      <motion.div
        className="absolute bottom-4 right-4 rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400"
        initial={{ scale: 0 }}
        animate={{ scale: visibleLines >= codeLines.length ? 1 : 0 }}
      >
        ✓ Accepted — 42ms
      </motion.div>
    </div>
  );
}
