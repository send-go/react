# @sendgo/react

> **React / Next.js에서 카카오 알림톡, 브랜드메시지, SMS를 발송하는 공식 React SDK**

[![npm](https://img.shields.io/npm/v/@sendgo/react)](https://www.npmjs.com/package/@sendgo/react)
[![React](https://img.shields.io/badge/React-18%2B-61DAFB?logo=react)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?logo=next.js)](https://nextjs.org)

> **중요**: 이 패키지는 **서버사이드 전용**입니다.
> Next.js Server Actions, Route Handlers, API Routes에서만 사용하세요.
> 클라이언트 컴포넌트에서 직접 사용하면 API 키가 브라우저에 노출됩니다.

---

## 설치

```bash
npm install @sendgo/react @sendgo/node
# 또는
pnpm add @sendgo/react @sendgo/node
```

---

## 빠른 시작

### Next.js Server Action

```typescript
// app/actions/notify.ts
'use server'

import { createSendgoClient } from '@sendgo/react';

const sendgo = createSendgoClient({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  apiVersion:     'v2',
});

export async function sendOrderConfirmAction(phone: string, orderNo: string) {
  return sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNo }],
  });
}
```

### 클라이언트 컴포넌트에서 훅 사용

```tsx
// app/components/OrderButton.tsx
'use client'

import { useAlimtalk } from '@sendgo/react';
import { sendOrderConfirmAction } from '../actions/notify';

export function OrderButton({ phone, orderNo }: { phone: string; orderNo: string }) {
  const { send, loading, error } = useAlimtalk(sendOrderConfirmAction);

  return (
    <div>
      <button
        onClick={() => send(phone, orderNo)}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? '발송 중...' : '주문 확인 알림 전송'}
      </button>
      {error && <p className="text-red-500">발송 실패: {error.message}</p>}
    </div>
  );
}
```

---

## 알림톡 상세 사용법

```typescript
// app/actions/alimtalk.ts
'use server'

import { createSendgoClient } from '@sendgo/react';

const sendgo = createSendgoClient({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  smsSenderKey:   process.env.SENDGO_SMS_SENDER_KEY,
  apiVersion:     'v2',
});

// 다건 발송
export async function sendBulkAlimtalk() {
  return sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [
      { contact: '01011111111', name: '홍길동', var1: 'ORD-001', var2: '29,000원' },
      { contact: '01022222222', name: '김철수', var1: 'ORD-002', var2: '15,000원' },
      { contact: '01033333333', name: '이영희', var1: 'ORD-003', var2: '52,000원' },
    ],
  });
}

// 예약 발송
export async function sendScheduledAlimtalk(phone: string) {
  return sendgo.alimtalk.send({
    templateCode:  'PROMO_SUMMER_2026',
    scheduleType:  'SCHEDULED',
    at:            '2026-07-28 09:00:00',
    contacts:      [{ contact: phone, var1: '여름 한정 50% 할인' }],
  });
}

// SMS 대체 발송
export async function sendWithFallback(phone: string, trackingNo: string) {
  return sendgo.alimtalk.send({
    templateCode:  'DELIVERY_START_001',
    replaceSms:    'Y',
    smsSubject:    '[배송 시작 안내]',
    smsContent:    `주문하신 상품이 출고되었습니다.\n송장번호: ${trackingNo}`,
    contacts:      [{ contact: phone, var1: 'ORD-001', var2: trackingNo }],
  });
}
```

---

## SMS / LMS / MMS 사용법

```typescript
// app/actions/sms.ts
'use server'

import { createSendgoClient } from '@sendgo/react';

const sendgo = createSendgoClient({ accessKey: '...', secretKey: '...' });

// SMS
export async function sendSms(phone: string, code: string) {
  return sendgo.sms.sendSms({
    content:  `[Sendgo] 인증번호: ${code} (5분 이내 입력)`,
    contacts: [{ contact: phone }],
  });
}

// LMS
export async function sendLms(phone: string) {
  return sendgo.sms.sendLms({
    subject:  '[중요] 서비스 점검 안내',
    content:  '안녕하세요. 서비스 점검이 예정되어 있습니다.\n■ 일시: 2026-07-25 02:00 ~ 06:00',
    contacts: [{ contact: phone }],
  });
}
```

---

## Route Handler (App Router)

```typescript
// app/api/notify/order/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSendgoClient } from '@sendgo/react';

const sendgo = createSendgoClient({
  accessKey:      process.env.SENDGO_ACCESS_KEY!,
  secretKey:      process.env.SENDGO_SECRET_KEY!,
  kakaoSenderKey: process.env.SENDGO_KAKAO_SENDER_KEY,
  apiVersion:     'v2',
});

export async function POST(request: NextRequest) {
  const { phone, orderNo, amount } = await request.json();

  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNo, var2: amount }],
  });

  return NextResponse.json({ success: true });
}
```

---

## useSms 훅

```tsx
'use client'

import { useSms } from '@sendgo/react';
import { sendSmsAction } from '../actions/sms';

export function VerificationForm() {
  const [phone, setPhone] = useState('');
  const { send, loading, error, data } = useSms(sendSmsAction);

  return (
    <form onSubmit={(e) => { e.preventDefault(); send(phone, '123456'); }}>
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="010-0000-0000"
      />
      <button type="submit" disabled={loading}>
        {loading ? '발송 중...' : '인증번호 받기'}
      </button>
      {error && <p className="error">발송 실패: {error.message}</p>}
      {data && <p className="success">인증번호가 발송되었습니다.</p>}
    </form>
  );
}
```

---

## 관련 패키지

| 언어/프레임워크 | 패키지 | GitHub |
|----------------|--------|--------|
| Node.js (코어) | `@sendgo/node` | [node](https://github.com/send-go/node) |
| Vue.js / Nuxt | `@sendgo/vue` | [vue](https://github.com/send-go/vue) |
| Spring Boot | `io.sendgo:sendgo-spring` | [spring](https://github.com/send-go/spring) |
| Python | `sendgo-python` | [python](https://github.com/send-go/python) |
| 전체 목록 | — | [send-go GitHub 조직](https://github.com/send-go) |

---

## 브랜드메시지 · 짧은 URL

이 패키지는 코어(`@sendgo/node`)의 클라이언트를 그대로 노출하므로, 코어에 있는 채널이
모두 그대로 쓸 수 있습니다. 두 기능 모두 **v2 전용**입니다.

| 기능 | 접근 |
|------|------|
| 카카오 브랜드메시지 (친구톡의 후속 채널) | `sendBrandMessage()` |
| 짧은 URL (단축 + 클릭 반응 분석) | `createShortUrl() / shortUrlStats()` |

브랜드메시지는 채널 친구가 아닌 수신자에게도 보낼 수 있고(`targeting` = `N`),
수신 동의한 전체 채널 친구에게 동보 발송할 수도 있습니다(`targeting` = `F`).

짧은 URL 은 메시지 본문의 링크를 줄이고 클릭 반응(일별 추이·디바이스·유입경로·국가)을
집계합니다.

사용 예시와 파라미터는 [코어 README](https://github.com/send-go) 와
[SDK 가이드](https://sendgo.io/ko/sdk) 를 참고하세요.

## 관리 API — 채널·템플릿·발신번호 등록 (v2 전용)

등록·심사 작업을 Server Action 으로 노출합니다. **서버에서만** 호출하세요 —
관리 API 도 발송 API 와 같은 키를 쓰므로 브라우저에 노출되면 안 됩니다.

| Server Action | 하는 일 |
| --- | --- |
| `requestKakaoChannelCode(yellowId, phone)` | 1단계 — 관리자 휴대폰으로 인증번호 SMS 발송 |
| `registerKakaoChannel(params)` | 2단계 — 인증번호로 발신프로필 생성 |
| `listKakaoSenders()` · `syncKakaoSenders(key?)` | 발신프로필 목록 · 상태 동기화 |
| `createNoticeTemplate(params)` | 알림톡 템플릿 등록 |
| `requestNoticeTemplateInspection(code, comment?)` | 검수 요청 |
| `syncNoticeTemplate(code)` | 검수 결과 폴링 |
| `listNoticeTemplates(params?)` | 알림톡 템플릿 목록 |
| `createBrandTemplate(params)` · `listBrandTemplates(params?)` | 브랜드메시지 템플릿 |
| `senderNumberTypes()` · `validateSenderNumber(phone, type)` | 발신번호 유형 · 중복 확인 |
| `registerSender(params, files)` | 발신번호 등록 신청 |
| `listSenders()` | 발신번호 목록 (심사 상태 확인) |
| `createMessageTemplate(params)` · `listMessageTemplates(params?)` | 문자 상용구 템플릿 |
| `uploadKakaoImage(type, file)` · `uploadKakaoImages(type, files)` | 카카오 이미지 업로드 — 템플릿용 URL 발급 |
| `listRejectedNumbers(params?)` | 수신거부(080) 번호 조회 |
| `subscribeWebhook(params)` · `getWebhook()` · `testWebhook()` | 이벤트 웹훅 구독 |

여기 없는 메서드(승인 취소, 휴면 해제, 템플릿 수정 등)는 `createSendgoClient()`
로 클라이언트를 받아 직접 부르세요.

> **sendgo.io 콘솔에 들어올 일이 없습니다.** 휴대폰 발신번호는 PASS 대신
> 신분증 사본을 받아 sendgo 운영자가 대신 심사합니다. 사람이 개입하는 지점은
> 카카오 채널 인증번호 하나뿐이고, 그것도 여러분 화면에서 입력받으면 됩니다.
> 심사가 붙는 것들은 비동기라 웹훅으로 결과를 받으세요.

```tsx
// app/onboarding/actions.ts
'use server';

import {
  requestKakaoChannelCode,
  registerKakaoChannel,
  createNoticeTemplate,
  requestNoticeTemplateInspection,
} from '@sendgo/react';

export async function startChannelRegistration(formData: FormData) {
  await requestKakaoChannelCode(
    String(formData.get('yellowId')),
    String(formData.get('phone')),
  );
}

export async function finishChannelRegistration(formData: FormData) {
  const created = await registerKakaoChannel({
    token: String(formData.get('code')),        // 사용자가 문자로 받은 인증번호
    yellowId: String(formData.get('yellowId')),
    phoneNumber: String(formData.get('phone')),
    categoryCode: '001001',
  });

  const kakaoSenderKey = created.data.sender.kakaoSenderKey;

  const template = await createNoticeTemplate({
    kakaoSenderKey,
    templateName: '주문 접수 안내',
    templateContent: '#{name}님, 주문 #{orderNo}이 접수되었습니다.',
    templateMessageType: 'BA',
    templateEmphasizeType: 'NONE',
    categoryCode: '001001',
    messagePurpose: 'order_delivery',
    legalBasis: 'transaction',
    benefitOrigin: 'none',
    expiryType: 'none',
    optInReviewConfirmed: true,
    ctaClearConfirmed: true,
    policyConfirmed: true,
  });

  await requestNoticeTemplateInspection(template.data.template.templateCode);
}
```

검수 결과는 즉시 오지 않습니다. Route Handler 나 크론에서 `syncNoticeTemplate()`
을 돌려 `inspectionStatus` 가 `APR` 이 되는지 확인하세요.

---

## 변경 사항

### 1.3.0 (2026-09-11)

- **관리 API Server Action 추가** — 카카오 채널 등록(`requestKakaoChannelCode`,
  `registerKakaoChannel`), 알림톡 템플릿 등록·검수 요청·폴링
  (`createNoticeTemplate`, `requestNoticeTemplateInspection`, `syncNoticeTemplate`),
  브랜드메시지 템플릿, 발신번호 등록 신청(`registerSender`), 문자 상용구 템플릿.
- 관리 API 요청 타입을 re-export 했습니다.
- `@sendgo/node` 를 `^1.3.0` 으로 올렸습니다.
- **이벤트 웹훅** 추가 — 발신번호 승인, 알림톡 검수 결과, 채널 차단,
  브랜드메시지 타겟팅 결과를 구독해 받습니다. 서명은 받은 원본 바이트로
  검증합니다(SDK 에 검증 헬퍼 포함).
- **카카오 이미지 업로드** 추가 — 브랜드메시지 템플릿의 `imageUrl` 은 카카오가
  호스팅하는 URL 이어야 하는데, 그 URL 을 얻는 길이 콘솔에만 있었습니다.
- **수신거부(080) 조회** 추가 — 자기 DB 의 수신 상태를 맞출 수 있습니다.

### 1.2.1 (2026-08-14)

- 레지스트리 목록에 노출되는 패키지 설명에서 친구톡을 브랜드메시지로 교체했습니다.
  npm/PyPI/Packagist/Maven/NuGet/RubyGems 검색 결과에 그대로 찍히는 문자열이라
  종료된 채널을 계속 홍보하고 있었습니다.
- 검색 키워드에 `brand-message` 를 추가했습니다 (`friendtalk` 은 유입 검색어라 유지).

### 1.2.0 (2026-08-14)

- **친구톡 Deprecated 표기** — 친구톡은 카카오 정책에 따라 2025-12-31 종료되었고,
  2026-01-01 부터 발송 요청이 브랜드메시지(자유형)로 자동 대체 발송됩니다.
  관련 API 에 각 언어의 표준 deprecation 표기를 달았습니다.
- 자유 본문 타입(`FT`/`FI`/`FW`)의 개별 발송 경로는 아직 친구톡 API 뿐이라는 점을
  문서에 명시했습니다 — 브랜드메시지 API 는 그 조합에 `NOT_A_BRAND_MESSAGE` 를 반환합니다.
- 브랜드메시지 전환 안내와 메시지 타입 1:1 대응표를 README 에 추가했습니다.

### 1.1.0 (2026-08-11)

- 짧은 URL 서버 액션 추가 — `createShortUrl` / `listShortUrls` / `getShortUrl` / `shortUrlStats` / `deactivateShortUrl`

## 라이선스

MIT License © 2026 [Sendgo](https://sendgo.io)

---

*키워드: 카카오 알림톡 React, 카카오 친구톡 Next.js, SMS 발송 React, 알림톡 Next.js Server Action, React 카카오 API, Sendgo React SDK, Next.js 알림 발송*

## 계정 API (1.5.0)

코어 1.5.0의 계정·조직·API 키·허용 IP 관리 12개 API를 사용할 수 있습니다.
발송용 키 없이 에이전트 토큰만으로 구성할 수 있습니다.

발송용 `accessKey`/`secretKey`가 없는 단계에서 사용하는 **별도 계정 클라이언트**입니다.
콘솔에서 발급받은 에이전트 토큰(`SENDGO_AGENT_TOKEN`)으로 `/api/v2/account`를 호출합니다.
계정 조회에는 `account:read`, 키·허용 IP 변경에는 `keys:write` 권한이 필요합니다.
토큰 만료나 권한 부족(401/403)은 그대로 예외로 반환하며 자동 갱신·재시도하지 않습니다.

조직 선택은 서버에 저장되는 **사용자 계정의 현재 조직**을 바꿉니다. 같은 사용자로
여러 조직의 설정을 동시에 변경하지 마세요. 개인 계정으로 돌아가려면 조직 ID에
`null`(Python `None`, Ruby `nil`, Go `nil`) 또는 `personal`을 전달합니다.
키 발급 응답의 `data.apiKey.secretKey`는 한 번만 반환되므로 서버의 비밀 저장소에 보관하세요.
허용 IP가 하나라도 등록되면 목록 밖의 IP는 차단됩니다.
에이전트 토큰과 키는 브라우저·모바일 앱에 포함하거나 응답·로그에 출력하지 않습니다.

```typescript
import { AccountClient } from '@sendgo/react';
// Next.js Route Handler / 서버 코드에서만 사용합니다.
const account = new AccountClient({ agentToken: process.env.SENDGO_AGENT_TOKEN! });
const status = await account.me();
```

## 템플릿 폴더 (1.5.0)

기업 계정의 발송용 API 키와 `apiVersion=v2` 설정으로 사용하는 서버 전용 API입니다.
폴더는 알림톡·브랜드메시지가 공유하며, 목록의 `templateType`은 `notice` 또는 `brand`입니다.
목록은 `data.folders` 트리와 `total`, `uncategorised` 개수를 반환합니다.
`templateCount`는 하위 폴더를 제외한 해당 폴더의 템플릿 수입니다.

- 생성: `name`, 선택 `parentUuid`. 최대 5단계이며 같은 부모 아래 이름 중복은 409입니다.
- 이동: 동일 발신프로필의 `templateCodes` 1~100개. `folderUuid`는 필수이며 `null`이면 미분류로 이동합니다.
- 템플릿 목록: `folderUuid=none`은 미분류, UUID는 해당 폴더, 생략은 전체입니다.
- 템플릿 등록: 선택 필드 `folderUuid`로 폴더를 지정합니다. 기존 템플릿 수정 API 대신 폴더 이동 API를 사용하세요.

승인되지 않은 키의 `403 ACCESS_KEY_NOT_APPROVED`는 토큰 재발급·재시도 없이 반환합니다.
계정 API의 `autoApprove`는 서버 설정의 실제 승인 정책을 나타냅니다.

```ts
// Next.js 서버 코드에서만 호출합니다.
import { listTemplateFolders, createTemplateFolder, assignTemplateFolder } from '@sendgo/react';
await listTemplateFolders({ templateType: 'notice' });
await createTemplateFolder({ name: '주문 안내' });
await assignTemplateFolder({ templateType: 'notice', kakaoSenderKey,
  templateCodes: ['ORDER_001'], folderUuid: null });
```

코어 1.5.0 이상이 필요합니다. 전체 메서드는 [코어 문서](https://github.com/send-go/node#템플릿-폴더-150)를 참고하세요.
