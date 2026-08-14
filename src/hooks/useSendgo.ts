/**
 * @sendgo/react — React hooks for Sendgo API
 *
 * 주의: 이 훅들은 Next.js Server Actions, Server Components 또는
 * React Server 환경에서 사용해야 합니다.
 * API 키는 절대 브라우저(클라이언트)에 노출되면 안 됩니다.
 */

'use server';

import Sendgo from '@sendgo/node';
import type {
  ShortUrlParams,
  ShortUrlListParams,
  ShortUrlStatsParams,
  AlimtalkParams,
  BrandMessageListParams,
  BrandMessageParams,
  FriendtalkParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
} from '@sendgo/node';

export type {
  AlimtalkParams,
  BrandMessageListParams,
  BrandMessageParams,
  FriendtalkParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
};

let _client: Sendgo | null = null;

function getClient(config?: SendgoConfig): Sendgo {
  if (_client) return _client;
  const cfg: SendgoConfig = config ?? {
    accessKey:      process.env.SENDGO_ACCESS_KEY!,
    secretKey:      process.env.SENDGO_SECRET_KEY!,
    kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
    smsSenderKey:   process.env.SENDGO_SMS_SENDER_KEY,
    apiVersion:     (process.env.SENDGO_API_VERSION as 'v1' | 'v2') ?? 'v1',
  };
  _client = new Sendgo(cfg);
  return _client;
}

// ----------------------------------------------------------------
// Server Actions (Next.js App Router)
// ----------------------------------------------------------------

/** 알림톡 전송 Server Action */
export async function sendAlimtalk(params: AlimtalkParams): Promise<SendgoResponse> {
  return getClient().alimtalk.send(params);
}

/**
 * 친구톡 전송 Server Action.
 *
 * @deprecated 친구톡은 카카오 정책에 따라 2025-12-31 종료되었습니다.
 * 2026-01-01 부터 친구톡 발송 요청은 카카오 측에서 브랜드메시지(자유형)로 자동 대체
 * 발송되므로, 이 함수를 호출해도 실제로 나가는 것은 브랜드메시지입니다.
 * 신규 연동은 `sendBrandMessage()` 를 사용하세요.
 */
export async function sendFriendtalk(params: FriendtalkParams): Promise<SendgoResponse> {
  return getClient().friendtalk.send(params);
}

/**
 * 브랜드메시지 전송 Server Action.
 *
 * 브랜드메시지는 친구톡의 후속 채널로, 채널 친구가 아닌 수신자에게도
 * 보낼 수 있습니다(targeting: 'N'). v2 전용.
 */
export async function sendBrandMessage(params: BrandMessageParams): Promise<SendgoResponse> {
  return getClient().brandMessage.send(params);
}

/** 브랜드메시지 동보 전송 Server Action — 수신 동의한 전체 채널 친구. */
export async function broadcastBrandMessage(
  params: Omit<BrandMessageParams, 'targeting' | 'contacts'>,
): Promise<SendgoResponse> {
  return getClient().brandMessage.broadcast(params);
}

/** 브랜드메시지 캠페인 목록 조회 Server Action. */
export async function listBrandMessages(
  params: BrandMessageListParams = {},
): Promise<SendgoResponse> {
  return getClient().brandMessage.campaigns(params);
}

/** 브랜드메시지 캠페인 상세 조회 Server Action. */
export async function getBrandMessage(campaignId: string): Promise<SendgoResponse> {
  return getClient().brandMessage.campaign(campaignId);
}

/** SMS 전송 Server Action */
/**
 * 짧은 URL 을 만든다. v2 전용.
 *
 * 같은 원본 URL 을 다시 줄이면 기존 링크가 그대로 반환된다.
 * 캠페인별로 반응을 분리해 집계하려면 `forceNew: true` 를 쓴다.
 */
export async function createShortUrl(params: ShortUrlParams): Promise<SendgoResponse> {
  return getClient().shortUrl.create(params);
}

/** 짧은 URL 목록 조회. */
export async function listShortUrls(params: ShortUrlListParams = {}): Promise<SendgoResponse> {
  return getClient().shortUrl.list(params);
}

/** 짧은 URL 상세 조회. */
export async function getShortUrl(code: string): Promise<SendgoResponse> {
  return getClient().shortUrl.show(code);
}

/** 짧은 URL 반응 통계. 일별 추이와 디바이스/유입경로/국가별 분해를 반환한다. */
export async function shortUrlStats(
  code: string,
  params: ShortUrlStatsParams = {},
): Promise<SendgoResponse> {
  return getClient().shortUrl.stats(code, params);
}

/** 짧은 URL 리다이렉트 중지. 링크와 통계는 남는다. */
export async function deactivateShortUrl(code: string): Promise<SendgoResponse> {
  return getClient().shortUrl.deactivate(code);
}

export async function sendSms(params: Omit<SmsParams, 'messageType'>): Promise<SendgoResponse> {
  return getClient().sms.sendSms(params);
}

/** LMS 전송 Server Action */
export async function sendLms(params: Omit<SmsParams, 'messageType'>): Promise<SendgoResponse> {
  return getClient().sms.sendLms(params);
}

/** MMS 전송 Server Action */
export async function sendMms(params: Omit<SmsParams, 'messageType'>): Promise<SendgoResponse> {
  return getClient().sms.sendMms(params);
}

/** Sendgo 클라이언트 직접 접근 (Server Components / Route Handlers) */
export function createSendgoClient(config?: SendgoConfig): Sendgo {
  return config ? new Sendgo(config) : getClient();
}
