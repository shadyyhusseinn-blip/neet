import { useState, useCallback, useEffect } from 'react';

export interface FormField<T> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormValidationRule<T> {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: (value: T) => string | undefined;
}

export interface FormConfig<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, FormValidationRule<T[keyof T]>>>;
  onSubmit?: (values: T) => Promise<void> | void;
  onError?: (errors: Partial<Record<keyof T, string>>) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  persistKey?: string;
}

export function useForm<T extends Record<string, any>>(config: FormConfig<T>) {
  const {
    initialValues,
    validationRules = {},
    onSubmit,
    onError,
    autoSave = false,
    autoSaveDelay = 1000,
    persistKey,
  } = config;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [dirty, setDirty] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Load persisted values
  useEffect(() => {
    if (persistKey) {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setValues(parsed);
        }
      } catch (error) {
        console.error('Failed to load form state:', error);
      }
    }
  }, [persistKey]);

  // Auto-save
  useEffect(() => {
    if (autoSave && isDirty && persistKey) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem(persistKey, JSON.stringify(values));
        } catch (error) {
          console.error('Failed to save form state:', error);
        }
      }, autoSaveDelay);

      return () => clearTimeout(timer);
    }
  }, [values, isDirty, autoSave, autoSaveDelay, persistKey]);

  // Validate single field
  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationRules[name];
      if (!rules) return undefined;

      if (rules.required && (!value || value === '')) {
        return 'هذا الحقل مطلوب';
      }

      if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
        return 'القيمة غير صالحة';
      }

      if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
        return `يجب أن يكون الحد الأدنى ${rules.minLength} حرف`;
      }

      if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
        return `يجب أن يكون الحد الأقصى ${rules.maxLength} حرف`;
      }

      if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
        return `يجب أن يكون الحد الأدنى ${rules.min}`;
      }

      if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
        return `يجب أن يكون الحد الأقصى ${rules.max}`;
      }

      if (rules.custom) {
        return rules.custom(value);
      }

      return undefined;
    },
    [validationRules]
  );

  // Validate all fields
  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key as keyof T]);
      if (error) {
        newErrors[key as keyof T] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  // Handle field change
  const handleChange = useCallback(
    (name: keyof T, value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      setDirty((prev) => ({ ...prev, [name]: true }));
      setIsDirty(true);

      // Validate field if touched
      if (touched[name]) {
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error || undefined }));
      }
    },
    [touched, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));
      const error = validateField(name, values[name]);
      setErrors((prev) => ({ ...prev, [name]: error || undefined }));
    },
    [values, validateField]
  );

  // Handle field focus
  const handleFocus = useCallback((name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  // Reset form
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setDirty({});
    setIsDirty(false);
    if (persistKey) {
      localStorage.removeItem(persistKey);
    }
  }, [initialValues, persistKey]);

  // Submit form
  const handleSubmit = useCallback(
    async (e?: any) => {
      e?.preventDefault();

      // Mark all fields as touched
      const newTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(values).forEach((key) => {
        newTouched[key as keyof T] = true;
      });
      setTouched(newTouched);

      // Validate all fields
      const isValid = validateAll();

      if (!isValid) {
        onError?.(errors);
        return;
      }

      setIsSubmitting(true);

      try {
        await onSubmit?.(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateAll, errors, onSubmit, onError]
  );

  // Set field value programmatically
  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setDirty((prev) => ({ ...prev, [name]: true }));
    setIsDirty(true);
  }, []);

  // Set multiple field values
  const setFieldValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
    setDirty((prev) => ({
      ...prev,
      ...Object.keys(newValues).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
    }));
    setIsDirty(true);
  }, []);

  // Clear field error
  const clearFieldError = useCallback((name: keyof T) => {
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    values,
    errors,
    touched,
    dirty,
    isSubmitting,
    isDirty,
    handleChange,
    handleBlur,
    handleFocus,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldValues,
    clearFieldError,
    clearErrors,
    validateField,
    validateAll,
  };
}
