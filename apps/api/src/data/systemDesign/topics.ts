import type { SystemDesignTopic } from "@placepro/shared";

export const SYSTEM_DESIGN_TOPICS: SystemDesignTopic[] = [
  {
    id: "instagram",
    title: "Design Instagram",
    tagline: "Photo/video sharing social network",
    scaleHint: "~2B MAU, 100M+ DAU uploads, heavy read traffic on feeds",
    functionalRequirements: [
      "Upload photos/videos with captions and filters",
      "Follow users and view personalized home feed",
      "Like, comment, and share posts",
      "Stories (ephemeral 24h content)",
      "Search users and hashtags",
    ],
    nonFunctionalRequirements: [
      "Low latency feed (<300ms p95)",
      "High availability (99.99%)",
      "Eventual consistency acceptable for likes/views",
      "Global CDN for media delivery",
    ],
    discussionPoints: [
      "Feed generation: fan-out on write vs read",
      "Media storage (S3) + CDN + transcoding pipeline",
      "Sharding users, posts, and social graph",
      "Cache hot feeds and celebrity accounts",
      "Rate limiting, auth, and content moderation",
    ],
  },
  {
    id: "whatsapp",
    title: "Design WhatsApp",
    tagline: "Real-time messaging at global scale",
    scaleHint: "~2B users, billions of messages/day, E2E encryption expectation",
    functionalRequirements: [
      "1:1 and group messaging (text, media, voice notes)",
      "Delivery and read receipts",
      "Online/offline presence",
      "End-to-end encryption for messages",
      "Media sharing and voice/video calls (high level)",
    ],
    nonFunctionalRequirements: [
      "Sub-second message delivery",
      "Ordering and idempotency per chat",
      "Offline message sync on reconnect",
      "Multi-device support",
    ],
    discussionPoints: [
      "WebSocket/long-polling gateways and connection mapping",
      "Message queue per user or chat partition",
      "Storage: hot recent messages vs cold archive",
      "E2E encryption key exchange (Signal protocol overview)",
      "Push notifications via FCM/APNs",
    ],
  },
  {
    id: "uber",
    title: "Design Uber",
    tagline: "Ride-hailing marketplace matching riders and drivers",
    scaleHint: "Millions of concurrent trips, geo-distributed matching",
    functionalRequirements: [
      "Rider requests ride with pickup/dropoff",
      "Match nearest available driver",
      "Real-time trip tracking on map",
      "Fare estimation and payment",
      "Driver/rider ratings and trip history",
    ],
    nonFunctionalRequirements: [
      "Matching latency < few seconds",
      "Strong consistency for trip state machine",
      "High availability in peak demand",
      "Geo-indexed queries at scale",
    ],
    discussionPoints: [
      "Geospatial indexing (QuadTree, Geohash, S2)",
      "Dispatch service and surge pricing",
      "Trip state machine (requested → accepted → ongoing → completed)",
      "Payment idempotency and ledger",
      "Location streaming (Kafka) and map tile caching",
    ],
  },
  {
    id: "youtube",
    title: "Design YouTube",
    tagline: "Video upload, processing, and global streaming",
    scaleHint: "2B+ logged-in users, 500+ hours uploaded/minute",
    functionalRequirements: [
      "Upload and transcode videos to multiple resolutions",
      "Search and recommend videos",
      "Channels, subscriptions, and comments",
      "View counts and analytics for creators",
      "Adaptive bitrate streaming playback",
    ],
    nonFunctionalRequirements: [
      "Smooth playback with CDN edge caching",
      "Durable storage for petabytes of video",
      "High read:write ratio on metadata",
      "Copyright and content safety pipelines",
    ],
    discussionPoints: [
      "Upload → transcoding worker pipeline (async)",
      "Blob storage + CDN (HLS/DASH segments)",
      "Metadata DB vs object store separation",
      "Recommendation (collaborative + content features)",
      "Cache popular videos at edge; rate limit uploads",
    ],
  },
];

export function getSystemDesignTopic(id: string): SystemDesignTopic | undefined {
  return SYSTEM_DESIGN_TOPICS.find((t) => t.id === id);
}
