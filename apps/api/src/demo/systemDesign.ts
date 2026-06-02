import type { SystemDesignReport } from "@placepro/shared";

export const demoSystemDesignReport: SystemDesignReport = {
  id: "demo-system-design",
  topicId: "instagram",
  topicTitle: "Design Instagram",
  design: "",
  scores: {
    scalability: 78,
    architecture: 82,
    databaseDesign: 74,
    caching: 70,
    security: 76,
    overall: 76,
  },
  dimensionFeedback: [
    {
      dimension: "scalability",
      score: 78,
      feedback:
        "You identified horizontal scaling and CDN usage. Expand on feed fan-out strategy and how you handle celebrity accounts with millions of followers.",
      improvements: [
        "Quantify QPS and storage estimates (posts/day, media size)",
        "Compare fan-out on write vs fan-out on read with trade-offs",
      ],
    },
    {
      dimension: "architecture",
      score: 82,
      feedback:
        "Clear separation of API, feed service, and media pipeline. Add async workers for notifications and transcoding.",
      improvements: [
        "Draw data flow for upload → processing → feed invalidation",
        "Mention API gateway and service discovery",
      ],
    },
    {
      dimension: "databaseDesign",
      score: 74,
      feedback:
        "Relational model for users/posts is reasonable. Specify sharding key (user_id) and how comments/likes are stored at scale.",
      improvements: [
        "Add index strategy for feed queries",
        "Discuss SQL vs NoSQL for social graph edges",
      ],
    },
    {
      dimension: "caching",
      score: 70,
      feedback:
        "Redis for hot feeds mentioned briefly. Detail TTL, cache-aside vs write-through, and invalidation on new posts.",
      improvements: [
        "Cache celebrity feeds separately",
        "Use CDN cache headers for static media",
      ],
    },
    {
      dimension: "security",
      score: 76,
      feedback:
        "Auth and HTTPS covered. Add rate limiting, signed URLs for media, and abuse detection for uploads.",
      improvements: [
        "OAuth2/JWT session flow",
        "Content moderation pipeline for uploads",
      ],
    },
  ],
  summary:
    "Solid mid-level system design with good architectural decomposition. Strengthen quantitative estimates, caching invalidation, and deep-dive on feed generation to reach senior-level depth.",
  strengths: [
    "Identified core microservices and async processing",
    "Mentioned CDN and object storage for media",
    "Considered read-heavy traffic patterns",
  ],
  improvements: [
    "Add back-of-envelope capacity planning",
    "Elaborate database sharding and replication",
    "Detail cache layers and consistency model",
  ],
  recommendations: [
    "Practice drawing sequence diagrams for post upload and feed read",
    "Study fan-out on write vs read (Twitter/Instagram case studies)",
    "Review Grokking System Design for estimation templates",
  ],
  architectureHighlights: [
    "API Gateway → Feed Service / Media Service / User Service",
    "S3 + CloudFront for media; Redis for hot feeds",
    "Kafka for async fan-out and analytics events",
  ],
};
