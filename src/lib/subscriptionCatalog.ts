export interface SubscriptionPlan {
  name: string;
  monthlyAmount: number;
}

export interface SubscriptionService {
  id: string;
  name: string;
  plans: SubscriptionPlan[];
}

export interface SubscriptionGenre {
  id: string;
  label: string;
  services: SubscriptionService[];
}

/**
 * 2026年9月時点で調べて裏取りした価格。サブスクは値上げが頻繁なので、
 * 実装時点のスナップショットである旨をUI側でも注記する。
 */
export const SUBSCRIPTION_CATALOG: SubscriptionGenre[] = [
  {
    id: "video",
    label: "動画配信",
    services: [
      {
        id: "netflix",
        name: "Netflix",
        plans: [
          { name: "広告つきスタンダード", monthlyAmount: 890 },
          { name: "スタンダード", monthlyAmount: 1590 },
          { name: "プレミアム", monthlyAmount: 2290 },
        ],
      },
      {
        id: "amazon-prime",
        name: "Amazon Prime",
        plans: [
          { name: "通常", monthlyAmount: 600 },
          { name: "Prime Student", monthlyAmount: 300 },
        ],
      },
      {
        id: "disney-plus",
        name: "Disney+",
        plans: [
          { name: "スタンダード", monthlyAmount: 1250 },
          { name: "プレミアム", monthlyAmount: 1670 },
        ],
      },
      { id: "hulu", name: "Hulu", plans: [{ name: "通常", monthlyAmount: 1026 }] },
      { id: "u-next", name: "U-NEXT", plans: [{ name: "通常", monthlyAmount: 2189 }] },
    ],
  },
  {
    id: "music",
    label: "音楽",
    services: [
      {
        id: "spotify",
        name: "Spotify Premium",
        plans: [
          { name: "個人", monthlyAmount: 1080 },
          { name: "学生", monthlyAmount: 580 },
        ],
      },
      {
        id: "apple-music",
        name: "Apple Music",
        plans: [
          { name: "個人", monthlyAmount: 1180 },
          { name: "学生", monthlyAmount: 680 },
        ],
      },
      {
        id: "youtube-music",
        name: "YouTube Music Premium",
        plans: [{ name: "個人", monthlyAmount: 1080 }],
      },
    ],
  },
  {
    id: "ai-tools",
    label: "AI・ツール",
    services: [
      { id: "chatgpt-plus", name: "ChatGPT Plus", plans: [{ name: "個人", monthlyAmount: 3000 }] },
      { id: "claude-pro", name: "Claude Pro", plans: [{ name: "個人", monthlyAmount: 3000 }] },
      {
        id: "gemini-advanced",
        name: "Gemini Advanced (AI Pro)",
        plans: [{ name: "個人", monthlyAmount: 2900 }],
      },
    ],
  },
];
