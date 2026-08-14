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

## 변경 사항

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
