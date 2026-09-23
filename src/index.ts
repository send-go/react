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
  // 관리 API (v2 전용) — 등록 · 심사
  requestKakaoChannelCode,
  registerKakaoChannel,
  listKakaoSenders,
  syncKakaoSenders,
  createNoticeTemplate,
  listNoticeTemplates,
  requestNoticeTemplateInspection,
  syncNoticeTemplate,
  createBrandTemplate,
  listBrandTemplates,
  senderNumberTypes,
  validateSenderNumber,
  registerSender,
  listSenders,
  createMessageTemplate,
  listMessageTemplates,
  uploadKakaoImage,
  uploadKakaoImages,
  listRejectedNumbers,
  subscribeWebhook,
  getWebhook,
  testWebhook,
  createSendgoClient,
  listTemplateFolders,
  createTemplateFolder,
  assignTemplateFolder,
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
  // 관리 API 타입
  MultipartFile,
  KakaoSenderCreateParams,
  BrandMessageTargetType,
  NoticeTemplateParams,
  NoticeTemplateListParams,
  NoticeTemplateInspectionStatus,
  BrandTemplateParams,
  BrandTemplateListParams,
  SenderNumberType,
  ApiRegistrableSenderNumberType,
  SenderRegistrationParams,
  SenderRegistrationFiles,
  MessageTemplateParams,
  MessageTemplateListParams,
  WebhookEvent,
  WebhookSubscriptionParams,
  KakaoImageSingleType,
  KakaoImageMultiType,
  RejectedNumberListParams,
} from '@sendgo/node';
export { SendgoError, WebhookService, WEBHOOK_EVENTS } from '@sendgo/node';

// 계정 API는 서버 코드에서만 사용합니다.
export { AccountClient } from '@sendgo/node';
export type { AccountConfig, AccountResponse, ApiKeyCreateParams, AllowedIpParams } from '@sendgo/node';

export { TemplateFolderService } from '@sendgo/node';
export type { TemplateFolderType, TemplateFolderListParams, TemplateFolderCreateParams, TemplateFolderAssignParams } from '@sendgo/node';
