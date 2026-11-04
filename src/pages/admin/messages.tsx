import { useCallback, useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

type ContactMessage = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
  status: 'NEW' | 'READ' | 'ANSWERED';
  createdAt: string;
};

const statusLabels: Record<ContactMessage['status'], string> = {
  NEW: 'جدید',
  READ: 'خوانده‌شده',
  ANSWERED: 'پاسخ‌داده‌شده',
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const loadMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/messages');
      if (!response.ok) throw new Error('inbox request failed');
      const result = await response.json();
      setMessages(result.data);
    } catch {
      setErrorMessage('بارگذاری پیام‌ها ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/messages')
      .then((response) => {
        if (!response.ok) throw new Error('inbox request failed');
        return response.json();
      })
      .then((result) => {
        if (active) setMessages(result.data);
      })
      .catch(() => {
        if (active) setErrorMessage('بارگذاری پیام‌ها ناموفق بود.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateStatus = async (
    messageId: string,
    status: ContactMessage['status'],
  ) => {
    setUpdatingId(messageId);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: messageId,
          status,
          expectedStatus:
            messages.find((message) => message.id === messageId)?.status ?? status,
        }),
      });
      if (!response.ok) throw new Error('status update failed');
      setMessages((current) =>
        current.map((message) =>
          message.id === messageId ? { ...message, status } : message,
        ),
      );
      setStatusMessage('وضعیت پیام به‌روزرسانی شد.');
    } catch {
      setErrorMessage('به‌روزرسانی وضعیت پیام ناموفق بود.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <AdminLayout title="صندوق پیام‌ها">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">صندوق پیام‌ها</h1>
          <p className="mt-2 text-gray-600">پیام‌های دریافت‌شده از فرم تماس</p>
        </div>
        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-4 text-red-800" role="alert">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                setErrorMessage('');
                void loadMessages();
              }}
              className="mt-2 underline"
            >
              بارگذاری دوباره
            </button>
          </div>
        )}
        {statusMessage && (
          <p className="rounded-lg bg-emerald-50 p-4 text-emerald-800" role="status">
            {statusMessage}
          </p>
        )}
        {isLoading ? (
          <p role="status">در حال بارگذاری پیام‌ها…</p>
        ) : messages.length === 0 && !errorMessage ? (
          <p className="rounded-xl bg-white p-8 text-center text-gray-600">
            پیامی در صندوق وجود ندارد.
          </p>
        ) : (
          <ul className="space-y-4">
            {messages.map((message) => (
              <li
                key={message.id}
                className="space-y-4 rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      {message.firstName} {message.lastName}
                    </h2>
                    <p className="text-sm text-gray-600">
                      <a className="underline" href={`mailto:${message.email}`}>
                        {message.email}
                      </a>
                      {message.phone && ` · ${message.phone}`}
                    </p>
                    <time
                      className="mt-1 block text-sm text-gray-500"
                      dateTime={message.createdAt}
                    >
                      {new Date(message.createdAt).toLocaleString('fa-IR')}
                    </time>
                  </div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    وضعیت پیام
                    <select
                      aria-label={`وضعیت پیام ${message.firstName} ${message.lastName}`}
                      value={message.status}
                      disabled={updatingId === message.id}
                      onChange={(event) =>
                        void updateStatus(
                          message.id,
                          event.target.value as ContactMessage['status'],
                        )
                      }
                      className="rounded-lg border border-gray-300 p-2"
                    >
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <p className="whitespace-pre-wrap break-words text-gray-800">
                  {message.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}
