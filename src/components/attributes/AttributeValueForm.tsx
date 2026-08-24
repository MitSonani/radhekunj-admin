'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { FormActions } from '@/components/forms/FormActions';
import { FormError } from '@/components/forms/FormError';
import { FormField } from '@/components/forms/FormField';
import { ATTRIBUTE_CONSTRAINTS } from '@/constants';
import type {
  AttributeValue,
  CreateAttributeValuePayload,
  UpdateAttributeValuePayload,
} from '@/services/api';
import { ApiError } from '@/types/api';

const DEFAULT_COLOR = '#000000';

type FieldErrors = {
  value?: string;
  colorCode?: string;
};

interface AttributeValueFormProps {
  mode: 'create' | 'edit';
  supportsColor: boolean;
  initialValue?: AttributeValue;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onCreate?: (payload: CreateAttributeValuePayload) => Promise<void>;
  onUpdate?: (payload: UpdateAttributeValuePayload) => Promise<void>;
}

function normalizeHexInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
}

function isValidColorCode(value: string): boolean {
  return ATTRIBUTE_CONSTRAINTS.COLOR_CODE_PATTERN.test(value);
}

function validate(value: string, colorCode: string, supportsColor: boolean): FieldErrors {
  const errors: FieldErrors = {};

  if (!value) {
    errors.value = 'Value is required';
  } else if (value.length > ATTRIBUTE_CONSTRAINTS.VALUE_MAX) {
    errors.value = `Value cannot exceed ${ATTRIBUTE_CONSTRAINTS.VALUE_MAX} characters`;
  } else if (!/[a-z0-9]/i.test(value)) {
    errors.value = 'Value must contain letters or numbers';
  }

  if (supportsColor) {
    if (!colorCode) {
      errors.colorCode = 'Color code is required';
    } else if (!isValidColorCode(colorCode)) {
      errors.colorCode = 'Color must be a 6-digit hex value such as #164A35';
    }
  }

  return errors;
}

export function AttributeValueForm({
  mode,
  supportsColor,
  initialValue,
  isSubmitting,
  error,
  onCancel,
  onCreate,
  onUpdate,
}: AttributeValueFormProps) {
  const [value, setValue] = useState(initialValue?.value ?? '');
  const [colorCode, setColorCode] = useState(initialValue?.colorCode ?? (supportsColor ? DEFAULT_COLOR : ''));
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const pickerValue = isValidColorCode(colorCode) ? colorCode : DEFAULT_COLOR;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValue = value.trim();
    const normalizedColor = normalizeHexInput(colorCode);
    const nextFieldErrors = validate(trimmedValue, normalizedColor, supportsColor);
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    try {
      if (mode === 'create') {
        const payload: CreateAttributeValuePayload = { value: trimmedValue };
        if (supportsColor) {
          payload.colorCode = normalizedColor;
        }
        await onCreate?.(payload);
        return;
      }

      const payload: UpdateAttributeValuePayload = { value: trimmedValue };
      if (supportsColor) {
        payload.colorCode = normalizedColor;
      }
      await onUpdate?.(payload);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 409) {
        setFieldErrors({ value: err.message });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Value"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setFieldErrors((current) => ({ ...current, value: undefined }));
        }}
        maxLength={ATTRIBUTE_CONSTRAINTS.VALUE_MAX}
        required
        disabled={isSubmitting}
        error={fieldErrors.value}
      />

      {supportsColor && (
        <FormField label="Color" htmlFor="attribute-value-color" required error={fieldErrors.colorCode}>
          <div className="flex items-center gap-3">
            <input
              id="attribute-value-color"
              type="color"
              value={pickerValue}
              onChange={(event) => {
                setColorCode(event.target.value.toUpperCase());
                setFieldErrors((current) => ({ ...current, colorCode: undefined }));
              }}
              disabled={isSubmitting}
              className="h-9 w-12 cursor-pointer rounded-md border border-border bg-surface p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Color picker"
            />
            <Input
              value={colorCode}
              onChange={(event) => {
                setColorCode(normalizeHexInput(event.target.value));
                setFieldErrors((current) => ({ ...current, colorCode: undefined }));
              }}
              maxLength={7}
              disabled={isSubmitting}
              placeholder="#000000"
              aria-label="Color hex code"
            />
          </div>
        </FormField>
      )}

      <FormError message={fieldErrors.value || fieldErrors.colorCode ? null : error} />

      <FormActions>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {mode === 'create' ? 'Add value' : 'Save changes'}
        </Button>
      </FormActions>
    </form>
  );
}
