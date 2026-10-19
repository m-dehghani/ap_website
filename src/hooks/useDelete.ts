import { useState, useCallback } from 'react';

interface UseDeleteOptions<T> {
  onSuccess?: (deletedId: string, data: T) => void;
  onError?: (error: Error) => void;
}

export interface DeleteActions {
  handleDelete: (id: string, confirmMessage?: string) => Promise<boolean>;
  isDeleting: (id: string) => boolean;
}

export function useDelete<T>(
  deleteFn: (id: string) => Promise<T>,
  options: UseDeleteOptions<T> = {}
) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleDelete = useCallback(
    async (id: string, confirmMessage = 'آیا از حذف مطمئن هستید؟') => {
      if (!window.confirm(confirmMessage)) return false;

      setError(null);
      setDeletingId(id);
      try {
        const result = await deleteFn(id);
        options.onSuccess?.(id, result);
        return true;
      } catch (err) {
        const deleteError =
          err instanceof Error ? err : new Error('حذف مورد با خطا مواجه شد');
        setError(deleteError);
        options.onError?.(deleteError);
        return false;
      } finally {
        setDeletingId(null);
      }
    },
    [deleteFn, options]
  );

  return {
    handleDelete,
    error,
    deletingId,
    isDeleting: (id: string) => deletingId === id,
  };
}