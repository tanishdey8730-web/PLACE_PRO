"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Problems Solved", value: 2500000, suffix: "+" },
  { label: "Placement Rate", value: 87, suffix: "%" },
  { label: "Partner Companies", value: 500, suffix: "+" },
];

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export function AnimatedStats() {
  const count0 = useCountUp(stats[0].value);
  const count1 = useCountUp(stats[1].value);
  const count2 = useCountUp(stats[2].value);
  const counts = [count0, count1, count2];

  return (
    <div className="mt-12 grid grid-cols-3 gap-4 border-t border-border/50 pt-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
        >
          <p className="text-2xl font-bold gradient-text sm:text-3xl">
            {stat.value >= 1000000
              ? `${(counts[i] / 1000000).toFixed(1)}M`
              : counts[i].toLocaleString()}
            {stat.suffix}
          </p>
          <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
