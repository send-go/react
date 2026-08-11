// Server-side utilities (Next.js Server Actions / Route Handlers)
export {
  sendAlimtalk,
  sendFriendtalk,
  sendBrandMessage,
  broadcastBrandMessage,
  listBrandMessages,
  getBrandMessage,
  createShortUrl,
  listShortUrls,
  getShortUrl,
  shortUrlStats,
  deactivateShortUrl,
  sendSms,
  sendLms,
  sendMms,
  createSendgoClient,
} from './hooks/useSendgo';

// Client-side hooks
export { useAlimtalk } from './hooks/useAlimtalk';

// Re-export types from @sendgo/node
export type {
  AlimtalkParams,
  BrandMessageParams,
  BrandMessageListParams,
  BrandMessageTargeting,
  ShortUrlParams,
  ShortUrlListParams,
  ShortUrlStatsParams,
  FriendtalkParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
  Contact,
} from '@sendgo/node';
export { SendgoError } from '@sendgo/node';
