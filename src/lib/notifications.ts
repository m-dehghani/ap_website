type EmailMessage = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: EmailMessage) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    throw new Error('Email delivery is not configured (RESEND_API_KEY, RESEND_FROM)');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text }),
  });
  if (!response.ok) {
    throw new Error(`Email provider rejected the message (${response.status})`);
  }
}

export async function sendSms(to: string, text: string) {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  if (!apiKey) {
    throw new Error('SMS delivery is not configured (KAVENEGAR_API_KEY)');
  }

  const body = new URLSearchParams({ receptor: to, message: text });
  if (process.env.KAVENEGAR_SENDER) {
    body.set('sender', process.env.KAVENEGAR_SENDER);
  }
  const response = await fetch(
    `https://api.kavenegar.com/v1/${encodeURIComponent(apiKey)}/sms/send.json`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    },
  );
  if (!response.ok) {
    throw new Error(`SMS provider rejected the message (${response.status})`);
  }

  const result = (await response.json()) as {
    return?: { status?: number; message?: string };
  };
  if (result.return?.status !== 200) {
    throw new Error(`SMS provider rejected the message (${result.return?.status ?? 'unknown'})`);
  }
}
