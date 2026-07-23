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
  AlimtalkParams,
  FriendtalkParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
} from '@sendgo/node';

export type { AlimtalkParams, FriendtalkParams, SmsParams, SendgoConfig, SendgoResponse };

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

/** 친구톡 전송 Server Action */
export async function sendFriendtalk(params: FriendtalkParams): Promise<SendgoResponse> {
  return getClient().friendtalk.send(params);
}

/** SMS 전송 Server Action */
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
