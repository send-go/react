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
  MultipartFile,
  ShortUrlParams,
  ShortUrlListParams,
  ShortUrlStatsParams,
  AlimtalkParams,
  BrandMessageListParams,
  BrandMessageParams,
  BrandTemplateListParams,
  BrandTemplateParams,
  FriendtalkParams,
  KakaoSenderCreateParams,
  MessageTemplateListParams,
  MessageTemplateParams,
  NoticeTemplateListParams,
  NoticeTemplateParams,
  RejectedNumberListParams,
  SenderNumberType,
  SenderRegistrationFiles,
  SenderRegistrationParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
  WebhookSubscriptionParams,
  KakaoImageSingleType,
  KakaoImageMultiType,
} from '@sendgo/node';

export type {
  AlimtalkParams,
  BrandMessageListParams,
  BrandMessageParams,
  BrandTemplateListParams,
  BrandTemplateParams,
  FriendtalkParams,
  KakaoSenderCreateParams,
  MessageTemplateListParams,
  MessageTemplateParams,
  NoticeTemplateListParams,
  NoticeTemplateParams,
  RejectedNumberListParams,
  SenderNumberType,
  SenderRegistrationFiles,
  SenderRegistrationParams,
  SmsParams,
  SendgoConfig,
  SendgoResponse,
  WebhookSubscriptionParams,
  KakaoImageSingleType,
  KakaoImageMultiType,
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

// ----------------------------------------------------------------
// 관리 API (v2 전용) — 등록 · 심사
//
// 콘솔에서만 되던 작업을 Server Action 으로 노출한다. 여기 없는 메서드
// (승인 취소, 휴면 해제, 템플릿 수정 등)는 `createSendgoClient()` 로
// 클라이언트를 받아 직접 부르면 된다 — 얇은 래퍼를 무한정 늘리지 않는다.
//
// 사람이 개입하는 지점은 하나뿐이다: 카카오 채널 인증번호는 채널 관리자
// 휴대폰으로 SMS 발송되므로, 사용자가 그 코드를 여러분 화면에 입력해야 한다.
// 휴대폰 발신번호는 PASS 대신 신분증 사본을 첨부해 접수하면 sendgo 가 대신
// 심사한다 — 어느 쪽도 sendgo.io 콘솔을 거치지 않는다.
// ----------------------------------------------------------------

/**
 * 1단계 — 카카오 채널 인증번호 발송. 응답에 인증번호는 없다.
 * 사용자가 문자로 받아 `registerKakaoChannel()` 에 넣어야 한다.
 */
export async function requestKakaoChannelCode(
  yellowId: string,
  phoneNumber: string,
): Promise<SendgoResponse> {
  return getClient().kakaoSenders.requestToken(yellowId, phoneNumber);
}

/** 2단계 — 인증번호로 카카오 발신프로필 등록. */
export async function registerKakaoChannel(
  params: KakaoSenderCreateParams,
): Promise<SendgoResponse> {
  return getClient().kakaoSenders.create(params);
}

/** 발신프로필 목록. */
export async function listKakaoSenders(): Promise<SendgoResponse> {
  return getClient().kakaoSenders.list();
}

/** 발신프로필 상태 동기화. 키를 주면 단건, 없으면 전체. */
export async function syncKakaoSenders(kakaoSenderKey?: string): Promise<SendgoResponse> {
  return getClient().kakaoSenders.sync(kakaoSenderKey);
}

/** 알림톡 템플릿 등록. 등록만으로는 발송할 수 없다 — 검수를 요청해야 한다. */
export async function createNoticeTemplate(
  params: NoticeTemplateParams,
): Promise<SendgoResponse> {
  return getClient().noticeTemplates.create(params);
}

/** 알림톡 템플릿 목록. */
export async function listNoticeTemplates(
  params: NoticeTemplateListParams = {},
): Promise<SendgoResponse> {
  return getClient().noticeTemplates.list(params);
}

/** 알림톡 검수 요청. 결과는 비동기이므로 `syncNoticeTemplate()` 로 폴링한다. */
export async function requestNoticeTemplateInspection(
  templateCode: string,
  comment?: string,
): Promise<SendgoResponse> {
  return getClient().noticeTemplates.requestInspection(templateCode, comment);
}

/** 알림톡 템플릿 상태 동기화 — `inspectionStatus` 가 APR 이 되는지 확인한다. */
export async function syncNoticeTemplate(templateCode: string): Promise<SendgoResponse> {
  return getClient().noticeTemplates.sync(templateCode);
}

/** 브랜드메시지 템플릿 등록. 알림톡과 달리 검수 요청 단계가 없다. */
export async function createBrandTemplate(
  params: BrandTemplateParams,
): Promise<SendgoResponse> {
  return getClient().brandTemplates.create(params);
}

/** 브랜드메시지 템플릿 목록. */
export async function listBrandTemplates(
  params: BrandTemplateListParams = {},
): Promise<SendgoResponse> {
  return getClient().brandTemplates.list(params);
}

/** 발신번호 유형과 유형별 필수 서류. */
export async function senderNumberTypes(): Promise<SendgoResponse> {
  return getClient().senderRegistration.numberTypes();
}

/** 발신번호 등록 전 형식·중복 확인. */
export async function validateSenderNumber(
  phoneE164: string,
  senderNumberType: SenderNumberType,
): Promise<SendgoResponse> {
  return getClient().senderRegistration.validate(phoneE164, senderNumberType);
}

/**
 * 발신번호 등록 신청. 접수만 되고(`PENDING`) 운영자 승인 후 쓸 수 있다.
 *
 * 휴대폰 유형은 PASS 본인인증이 필요해 `IDENTITY_VERIFICATION_REQUIRED` 로
 * 거절된다 — 콘솔에서 등록해야 한다.
 */
export async function registerSender(
  params: SenderRegistrationParams,
  files: SenderRegistrationFiles,
): Promise<SendgoResponse> {
  return getClient().senderRegistration.create(params, files);
}

/** 발신번호 목록. 심사 상태(`status`)를 여기서 확인한다. */
export async function listSenders(): Promise<SendgoResponse> {
  return getClient().senderRegistration.list();
}

/** 문자 상용구 템플릿 등록. */
export async function createMessageTemplate(
  params: MessageTemplateParams,
): Promise<SendgoResponse> {
  return getClient().messageTemplates.create(params);
}

/** 문자 상용구 템플릿 목록. */
export async function listMessageTemplates(
  params: MessageTemplateListParams = {},
): Promise<SendgoResponse> {
  return getClient().messageTemplates.list(params);
}

/** 카카오 이미지 업로드. 브랜드메시지 템플릿의 imageUrl 은 이걸로 받는다. */
export async function uploadKakaoImage(
  type: KakaoImageSingleType,
  image: MultipartFile,
): Promise<SendgoResponse> {
  return getClient().kakaoImages.upload(type, image);
}

/** 카카오 다중 이미지 업로드 (캐러셀·와이드 아이템 리스트). */
export async function uploadKakaoImages(
  type: KakaoImageMultiType,
  images: MultipartFile[],
): Promise<SendgoResponse> {
  return getClient().kakaoImages.uploadMany(type, images);
}

/** 수신거부(080) 번호 목록. `since` 로 증분만 가져간다. */
export async function listRejectedNumbers(
  params: RejectedNumberListParams = {},
): Promise<SendgoResponse> {
  return getClient().rejectedNumbers.list(params);
}

/**
 * 이벤트 웹훅 구독. 등록·심사 결과를 폴링하지 않고 받는다.
 *
 * 생성한 시크릿은 응답에서 한 번만 나온다 — 즉시 저장할 것.
 */
export async function subscribeWebhook(
  params: WebhookSubscriptionParams,
): Promise<SendgoResponse> {
  return getClient().webhook.subscribe(params);
}

/** 현재 웹훅 구독 설정과 마지막 전송 결과. */
export async function getWebhook(): Promise<SendgoResponse> {
  return getClient().webhook.show();
}

/** 테스트 이벤트 발송 — 엔드포인트와 서명 검증 확인용. */
export async function testWebhook(): Promise<SendgoResponse> {
  return getClient().webhook.test();
}

/** Sendgo 클라이언트 직접 접근 (Server Components / Route Handlers) */
export function createSendgoClient(config?: SendgoConfig): Sendgo {
  return config ? new Sendgo(config) : getClient();
}

/** 폴더 트리를 조회합니다. 서버 코드에서만 호출합니다. */
export async function listTemplateFolders(params: import('@sendgo/node').TemplateFolderListParams = {}): Promise<SendgoResponse> {
  return getClient().templateFolders.list(params);
}

/** 루트 또는 하위 폴더를 생성합니다. */
export async function createTemplateFolder(params: import('@sendgo/node').TemplateFolderCreateParams): Promise<SendgoResponse> {
  return getClient().templateFolders.create(params);
}

/** 템플릿을 폴더 또는 미분류(null)로 이동합니다. */
export async function assignTemplateFolder(params: import('@sendgo/node').TemplateFolderAssignParams): Promise<SendgoResponse> {
  return getClient().templateFolders.assign(params);
}
