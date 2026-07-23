'use client';

import { useState, useCallback } from 'react';
import type { AlimtalkParams, SendgoResponse } from '@sendgo/node';
import { SendgoError } from '@sendgo/node';

export interface UseAlimtalkResult {
  send: (params: AlimtalkParams) => Promise<SendgoResponse | null>;
  loading: boolean;
  error: SendgoError | Error | null;
  data: SendgoResponse | null;
  reset: () => void;
}

/**
 * 알림톡 전송 훅 (클라이언트 컴포넌트용).
 * Server Action 또는 API Route를 통해 호출합니다.
 *
 * @param serverAction Next.js Server Action (sendAlimtalk 등)
 *
 * @example
 * // app/actions.ts
 * 'use server';
 * import { sendAlimtalk } from '@sendgo/react';
 * export { sendAlimtalk };
 *
 * // components/OrderButton.tsx
 * 'use client';
 * import { useAlimtalk } from '@sendgo/react/hooks';
 * import { sendAlimtalk } from '../actions';
 *
 * function OrderButton() {
 *   const { send, loading } = useAlimtalk(sendAlimtalk);
 *   return <button onClick={() => send({ templateCode: 'ORDER_001', contacts: [...] })} disabled={loading}>주문 확인</button>;
 * }
 */
export function useAlimtalk(
  serverAction: (params: AlimtalkParams) => Promise<SendgoResponse>,
): UseAlimtalkResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<SendgoError | Error | null>(null);
  const [data, setData] = useState<SendgoResponse | null>(null);

  const send = useCallback(async (params: AlimtalkParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await serverAction(params);
      setData(result);
      return result;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [serverAction]);

  const reset = useCallback(() => { setError(null); setData(null); }, []);

  return { send, loading, error, data, reset };
}
