// Server-side utilities (Next.js Server Actions / Route Handlers)
export {
  sendAlimtalk,
  sendFriendtalk,
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
  FriendtalkParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
  Contact,
} from '@sendgo/node';
export { SendgoError } from '@sendgo/node';
