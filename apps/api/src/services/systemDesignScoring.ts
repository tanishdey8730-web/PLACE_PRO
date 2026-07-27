import type {
  SystemDesignDimension,
  SystemDesignDimensionFeedback,
  SystemDesignReport,
  SystemDesignScores,
  SystemDesignTopic,
  SystemDesignTopicId,
} from "@placepro/shared";

function clamp(n: number): number {
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10;
}

const KEYWORDS: Record<SystemDesignDimension, RegExp[]> = {
  scalability: [
    /\b(scale|sharding|partition|horizontal|load balanc|replicat|qps|rps|throughput|million|billion|autoscaling)\b/i,
    /\b(fan-?out|kafka|rabbitmq|queue|worker|async)\b/i,
    /\b(cdn|edge|geo-?distrib)\b/i,
  ],
  architecture: [
    /\b(microservice|api gateway|service|monolith|event-?driven|soa)\b/i,
    /\b(rest|grpc|websocket|message broker)\b/i,
    /\b(client|server|layer|component|diagram)\b/i,
  ],
  databaseDesign: [
    /\b(sql|nosql|postgres|mysql|mongodb|cassandra|dynamodb|redis)\b/i,
    /\b(shard|index|replicat|primary|secondary|acid|cap|consistency)\b/i,
    /\b(schema|table|document|graph|relational)\b/i,
  ],
  caching: [
    /\b(cache|redis|memcached|cdn|ttl|evict|invalidate)\b/i,
    /\b(cache-?aside|write-?through|write-?behind|lru)\b/i,
  ],
  security: [
    /\b(auth|oauth|jwt|encrypt|tls|https|rate limit|ddos|acl)\b/i,
    /\b(e2e|end-?to-?end|permission|role|token|signed url)\b/i,
  ],
};

function scoreDimension(text: string, dimension: SystemDesignDimension): number {
  const patterns = KEYWORDS[dimension];
  const hits = patterns.filter((p) => p.test(text)).length;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  let base = 45 + hits * 12;
  if (words >= 200) base += 10;
  if (words >= 400) base += 8;
  if (words < 80) base -= 20;
  return clamp(base);
}

const DIMENSION_LABELS: Record<SystemDesignDimension, string> = {
  scalability: "Scalability",
  architecture: "Architecture",
  databaseDesign: "Database Design",
  caching: "Caching",
  security: "Security",
};

type DimensionRegexMap = Partial<Record<SystemDesignDimension, RegExp>>;

const TOPIC_BOOST: Partial<Record<SystemDesignTopicId, DimensionRegexMap>> = {
  instagram: {
    scalability: /\b(feed|timeline|fan-?out|cdn|media)\b/i,
    caching: /\b(feed|timeline|redis)\b/i,
  },
  whatsapp: {
    security: /\b(e2e|encrypt|signal|key)\b/i,
    scalability: /\b(websocket|presence|delivery)\b/i,
  },
  uber: {
    scalability: /\b(geo|location|match|dispatch|surge)\b/i,
    databaseDesign: /\b(trip|state|geohash|quadtree)\b/i,
  },
  youtube: {
    scalability: /\b(transcod|hls|dash|bitrate|upload)\b/i,
    caching: /\b(cdn|segment|edge)\b/i,
  },
};

function topicBonus(text: string, topicId: SystemDesignTopicId, dimension: SystemDesignDimension): number {
  const pattern = TOPIC_BOOST[topicId]?.[dimension];
  return pattern && pattern.test(text) ? 8 : 0;
}

export function computeLocalSystemDesignReport(
  topic: SystemDesignTopic,
  design: string
): Omit<SystemDesignReport, "id" | "completedAt"> {
  const dimensions: SystemDesignDimension[] = [
    "scalability",
    "architecture",
    "databaseDesign",
    "caching",
    "security",
  ];

  const scores: SystemDesignScores = {
    scalability: 0,
    architecture: 0,
    databaseDesign: 0,
    caching: 0,
    security: 0,
    overall: 0,
  };

  const dimensionFeedback: SystemDesignDimensionFeedback[] = dimensions.map((dimension) => {
    const score = clamp(
      scoreDimension(design, dimension) + topicBonus(design, topic.id, dimension)
    );
    scores[dimension] = score;
    return {
      dimension,
      score,
      feedback: buildLocalFeedback(dimension, score, topic.id),
      improvements: buildLocalImprovements(dimension, score),
    };
  });

  scores.overall = clamp(
    (scores.scalability +
      scores.architecture +
      scores.databaseDesign +
      scores.caching +
      scores.security) /
      5
  );

  const overall = scores.overall;

  return {
    topicId: topic.id,
    topicTitle: topic.title,
    design,
    scores,
    dimensionFeedback,
    summary: `Your ${topic.title} design scores ${overall}/100. ${
      overall >= 75
        ? "Strong foundation — refine estimates and failure modes."
        : overall >= 60
          ? "Good start — deepen each pillar with trade-offs and numbers."
          : "Cover all five evaluation areas with concrete technologies and flows."
    }`,
    strengths: pickStrengths(design, scores),
    improvements: pickImprovements(scores),
    recommendations: [
      `Re-read discussion points for ${topic.title}`,
      "Add back-of-envelope: users, QPS, storage, bandwidth",
      "Draw one sequence diagram for the critical path",
      "List failure scenarios and mitigations",
    ],
    architectureHighlights: extractHighlights(design),
  };
}

function buildLocalFeedback(
  dimension: SystemDesignDimension,
  score: number,
  topicId: SystemDesignTopicId
): string {
  const label = DIMENSION_LABELS[dimension];
  if (score >= 75) {
    return `${label} is well addressed for ${topicId}. Add quantitative estimates and explicit trade-offs to reach interview-ready depth.`;
  }
  if (score >= 60) {
    return `${label} is partially covered. Name specific technologies, data flows, and how the design behaves at peak load.`;
  }
  return `${label} needs more detail. Interviewers expect concrete choices (e.g., DB type, cache strategy, auth model) with justification.`;
}

function buildLocalImprovements(dimension: SystemDesignDimension, score: number): string[] {
  const tips: Record<SystemDesignDimension, string[]> = {
    scalability: [
      "Estimate DAU, QPS, and storage growth",
      "Explain horizontal scaling and bottlenecks",
    ],
    architecture: [
      "List services and how they communicate",
      "Show sync vs async boundaries",
    ],
    databaseDesign: [
      "Define entities, sharding key, and indexes",
      "State consistency requirements per use case",
    ],
    caching: [
      "Specify what is cached, TTL, and invalidation",
      "Layer CDN vs application cache",
    ],
    security: [
      "Describe authentication and authorization",
      "Mention rate limiting and data protection",
    ],
  };
  if (score >= 75) return [tips[dimension][0]!];
  return tips[dimension];
}

function pickStrengths(design: string, scores: SystemDesignScores): string[] {
  const strengths: string[] = [];
  if (scores.architecture >= 70) strengths.push("Clear system decomposition");
  if (scores.scalability >= 70) strengths.push("Scalability considerations present");
  if (/\b(redis|cache|cdn)\b/i.test(design)) strengths.push("Caching layer identified");
  if (/\b(shard|replicat|nosql|sql)\b/i.test(design)) strengths.push("Database strategy discussed");
  if (strengths.length === 0) strengths.push("Structured written design submitted");
  return strengths.slice(0, 4);
}

function pickImprovements(scores: SystemDesignScores): string[] {
  const dims: SystemDesignDimension[] = [
    "scalability",
    "architecture",
    "databaseDesign",
    "caching",
    "security",
  ];
  return dims
    .filter((d) => scores[d] < 70)
    .map((d) => `Strengthen ${DIMENSION_LABELS[d].toLowerCase()}`)
    .concat(["Add capacity estimation section", "Discuss single points of failure"])
    .slice(0, 5);
}

function extractHighlights(design: string): string[] {
  const lines = design
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 10 && /^[-*•\d]/.test(l) || /service|api|db|cache/i.test(l));
  return lines.slice(0, 5);
}

export function normalizeAiSystemDesign(
  raw: Record<string, unknown>,
  local: Omit<SystemDesignReport, "id" | "completedAt">
): Omit<SystemDesignReport, "id" | "completedAt"> {
  const scoresRaw = (raw.scores ?? raw.dimension_scores) as Record<string, unknown> | undefined;
  const num = (k: string, fallback: number) => {
    const v = scoresRaw?.[k];
    return typeof v === "number" ? clamp(v) : fallback;
  };

  const scores: SystemDesignScores = {
    scalability: num("scalability", local.scores.scalability),
    architecture: num("architecture", local.scores.architecture),
    databaseDesign: num("database_design", local.scores.databaseDesign) ||
      num("databaseDesign", local.scores.databaseDesign),
    caching: num("caching", local.scores.caching),
    security: num("security", local.scores.security),
    overall: num("overall", local.scores.overall),
  };
  if (!scoresRaw?.overall) {
    scores.overall = clamp(
      (scores.scalability +
        scores.architecture +
        scores.databaseDesign +
        scores.caching +
        scores.security) /
        5
    );
  }

  const dimMap: Record<string, SystemDesignDimension> = {
    scalability: "scalability",
    architecture: "architecture",
    database_design: "databaseDesign",
    databaseDesign: "databaseDesign",
    caching: "caching",
    security: "security",
  };

  const dimFb = raw.dimension_feedback as unknown[] | undefined;
  const dimensionFeedback: SystemDesignDimensionFeedback[] = Array.isArray(dimFb)
    ? dimFb.map((item, i) => {
        const o = item as Record<string, unknown>;
        const rawDim = String(o.dimension ?? "");
        const dimension =
          dimMap[rawDim] ||
          local.dimensionFeedback[i]?.dimension ||
          "architecture";
        return {
          dimension,
          score: typeof o.score === "number" ? clamp(o.score) : local.dimensionFeedback[i]?.score ?? 65,
          feedback: String(o.feedback ?? local.dimensionFeedback[i]?.feedback ?? ""),
          improvements: Array.isArray(o.improvements)
            ? o.improvements.map(String)
            : local.dimensionFeedback[i]?.improvements ?? [],
        };
      })
    : local.dimensionFeedback;

  return {
    ...local,
    scores,
    dimensionFeedback,
    summary: String(raw.summary ?? local.summary),
    strengths: Array.isArray(raw.strengths) ? raw.strengths.map(String) : local.strengths,
    improvements: Array.isArray(raw.improvements) ? raw.improvements.map(String) : local.improvements,
    recommendations: Array.isArray(raw.recommendations)
      ? raw.recommendations.map(String)
      : local.recommendations,
    architectureHighlights: Array.isArray(raw.architecture_highlights)
      ? raw.architecture_highlights.map(String)
      : Array.isArray(raw.architectureHighlights)
        ? raw.architectureHighlights.map(String)
        : local.architectureHighlights,
  };
}
