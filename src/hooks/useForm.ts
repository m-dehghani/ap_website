import { useState, useCallback, useMemo } from 'react';
import { ZodSchema, ZodError } from 'zod';
import { z } from 'zod';

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  onError?: (error: Error) => void;
}

interface UseFormResult<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setValues: (values: T | ((prev: T) => T)) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
  resetForm: () => void;
}

// Type guard for ZodError (compatible with Zod v3 and v4)
interface ZodErrorLike {
  issues?: z.ZodIssue[];
  errors?: z.ZodIssue[];
}

function isZodError(err: unknown): err is ZodErrorLike {
  return err instanceof ZodError || (err !== null && typeof err === 'object' && 'issues' in err);
}

// Extract field path from Zod issue (compatible with Zod v3 and v4)
function getIssuePath(issue: z.ZodIssue): (string | number)[] {
  const path = 'path' in issue ? issue.path : [];
  return path.filter((p): p is string | number => typeof p === 'string' || typeof p === 'number');
}

function getIssueMessage(issue: z.ZodIssue): string {
  return 'message' in issue ? issue.message : String(issue);
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
  onError,
}: UseFormOptions<T>): UseFormResult<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (valuesToValidate: T): Partial<Record<keyof T, string>> => {
      if (!validationSchema) return {};
      
      try {
        validationSchema.parse(valuesToValidate);
        return {};
      } catch (err) {
        if (isZodError(err)) {
          const fieldErrors: Partial<Record<keyof T, string>> = {};
          const issues = (err.issues ?? err.errors) as z.ZodIssue[];
          issues.forEach(e => {
            const path = getIssuePath(e)[0] as keyof T;
            if (path && !fieldErrors[path]) {
              fieldErrors[path] = getIssueMessage(e);
            }
          });
          return fieldErrors;
        }
        return { form: 'Validation failed' } as Partial<Record<keyof T, string>>;
      }
    },
    [validationSchema]
  );

  const isValid = useMemo(() => {
    if (!validationSchema) return true;
    return Object.keys(validate(values)).length === 0;
  }, [validate, values]);

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  const handleBlur = useCallback((name: keyof T) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validate({ ...values, [name]: values[name] });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }, [validate, values]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const validationErrors = validate(values);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Submission failed');
        onError?.(error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit, onError]
  );

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setFieldValue,
    setFieldError,
    resetForm,
  };
}