# @sendgo/react

> **Sendgo** React SDK — 카카오 알림톡/친구톡, SMS/LMS/MMS
> Next.js App Router Server Actions / Server Components 전용

[![npm](https://img.shields.io/npm/v/@sendgo/react)](https://www.npmjs.com/package/@sendgo/react)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black)](https://nextjs.org)

> **보안**: API 키는 서버에서만 사용합니다. 이 SDK의 핵심 기능은 Next.js Server Actions와 Server Components에서 사용하도록 설계되었습니다.

---

## 빠른 시작 (3단계)

### 1단계 — 설치

```bash
npm install @sendgo/react @sendgo/node
```

### 2단계 — 환경변수 설정

```env
# .env.local (서버 전용 — NEXT_PUBLIC_ 접두사 없음)
SENDGO_ACCESS_KEY=your_access_key
SENDGO_SECRET_KEY=your_secret_key
SENDGO_KAKAO_SENDER_KEY=your_kakao_key
SENDGO_SMS_SENDER_KEY=your_sms_key
SENDGO_API_VERSION=v2
```

### 3단계 — Server Action으로 알림톡 전송

```typescript
// app/actions/notification.ts
'use server';
import { sendAlimtalk } from '@sendgo/react';
export { sendAlimtalk };

// app/components/OrderButton.tsx
'use client';
import { useAlimtalk } from '@sendgo/react';
import { sendAlimtalk } from '../actions/notification';

export function OrderButton({ phone, orderNumber }: { phone: string; orderNumber: string }) {
  const { send, loading, error } = useAlimtalk(sendAlimtalk);

  return (
    <button onClick={() => send({ templateCode: 'ORDER_001', contacts: [{ contact: phone, var1: orderNumber }] })}
            disabled={loading}>
      {loading ? '발송 중...' : '주문 확인 알림 전송'}
    </button>
  );
}
```

---

## Next.js App Router 통합

### Route Handler

```typescript
// app/api/notify/route.ts
import { createSendgoClient } from '@sendgo/react';
import { NextRequest, NextResponse } from 'next/server';

const sendgo = createSendgoClient();

export async function POST(request: NextRequest) {
  const { phone, orderNumber } = await request.json();

  await sendgo.alimtalk.send({
    templateCode: 'ORDER_CONFIRM_001',
    contacts: [{ contact: phone, var1: orderNumber }],
  });

  return NextResponse.json({ success: true });
}
```

### Server Component

```typescript
// app/admin/page.tsx (Server Component)
import { sendAlimtalk } from '@sendgo/react';

export default async function AdminPage() {
  // 서버 컴포넌트에서 직접 전송 가능
  async function handleNotify(formData: FormData) {
    'use server';
    await sendAlimtalk({
      templateCode: 'ADMIN_NOTIFY_001',
      contacts: [{ contact: formData.get('phone') as string }],
    });
  }

  return <form action={handleNotify}>...</form>;
}
```

---

## SMS 전송

```typescript
import { sendSms, sendLms } from '@sendgo/react';

// Server Action
await sendSms({ content: '인증번호: 123456', contacts: [{ contact: '01012345678' }] });
await sendLms({ subject: '[공지]', content: '...', contacts: [...] });
```

---

## 라이선스

MIT License © [Sendgo](https://sendgo.io)
