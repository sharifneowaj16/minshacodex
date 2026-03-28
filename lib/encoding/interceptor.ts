import { fixEncodingDeep } from './index';

const originalFetch = globalThis.fetch;

export async function enhancedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const response = await originalFetch(input, init);
  const cloned = response.clone();

  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await cloned.json();
      const fixed = fixEncodingDeep(data);
      return new Response(JSON.stringify(fixed), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    }
  } catch (e) {}

  return response;
}

export function installFetchInterceptor() {
  if (typeof window !== 'undefined') {
    globalThis.fetch = enhancedFetch;
  }
}