async function getResponseError(response: Response): Promise<string> {
  const body = await response.text();

  if (body) {
    try {
      const parsed: unknown = JSON.parse(body);
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'error' in parsed &&
        typeof parsed.error === 'string'
      ) {
        return parsed.error;
      }
    } catch (error) {
      if (!(error instanceof SyntaxError)) {
        throw error;
      }
    }
  }

  return `${response.status} ${response.statusText}`.trim();
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }
  return response.json() as Promise<T>;
}

export async function deleteResource(url: string): Promise<void> {
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await getResponseError(response));
  }
}
