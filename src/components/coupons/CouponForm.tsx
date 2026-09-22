'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { FormActions } from '@/components/forms/FormActions';
import { FormError } from '@/components/forms/FormError';
import {
  COUPON_CONSTRAINTS,
  COUPON_DISCOUNT_TYPE,
  COUPON_SCOPE,
  COUPON_STATUS,
} from '@/constants';
import type {
  CouponDetail,
  CouponDiscountType,
  CouponScope,
  CouponStatus,
  CreateCouponPayload,
  UpdateCouponPayload,
} from '@/services/api';
import { ApiError } from '@/types/api';
import { CouponCategorySelector } from './CouponCategorySelector';
import { CouponProductSelector, type SelectedCouponProduct } from './CouponProductSelector';
import {
  defaultExpiresAtLocal,
  defaultStartsAtLocal,
  fieldErrorsFromApi,
  fromDateTimeLocalValue,
  normalizeMoney,
  parseOptionalInteger,
  toDateTimeLocalValue,
  type CouponFieldErrors,
} from './couponFormUtils';

interface CouponFormProps {
  mode: 'create' | 'edit';
  initialCoupon?: CouponDetail;
  isSubmitting: boolean;
  error: string | null;
  onCancel: () => void;
  onCreate?: (payload: CreateCouponPayload) => Promise<void>;
  onUpdate?: (payload: UpdateCouponPayload) => Promise<void>;
}

function validateMoney(value: string, label: string, options: { allowZero?: boolean } = {}): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (!COUPON_CONSTRAINTS.MONEY_PATTERN.test(trimmed)) {
    return `${label} must be a non-negative amount with up to 2 decimal places`;
  }

  const amount = Number(trimmed);
  if (options.allowZero) {
    if (amount < 0) {
      return `${label} cannot be negative`;
    }
    return undefined;
  }

  if (!(amount > 0)) {
    return `${label} must be greater than 0`;
  }

  return undefined;
}

export function CouponForm({
  mode,
  initialCoupon,
  isSubmitting,
  error,
  onCancel,
  onCreate,
  onUpdate,
}: CouponFormProps) {
  const isUsed = (initialCoupon?.usageCount ?? 0) > 0;
  const coreLocked = mode === 'edit' && isUsed;

  const [code, setCode] = useState(initialCoupon?.code ?? '');
  const [discountType, setDiscountType] = useState<CouponDiscountType>(
    initialCoupon?.discountType ?? COUPON_DISCOUNT_TYPE.PERCENTAGE
  );
  const [discountValue, setDiscountValue] = useState(initialCoupon?.discountValue ?? '');
  const [scope, setScope] = useState<CouponScope>(initialCoupon?.scope ?? COUPON_SCOPE.CART);
  const [selectedProducts, setSelectedProducts] = useState<SelectedCouponProduct[]>(
    initialCoupon?.products ?? []
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initialCoupon?.categories.map((category) => category.id) ?? []
  );
  const [minimumCartValue, setMinimumCartValue] = useState(initialCoupon?.minimumCartValue ?? '');
  const [maximumDiscount, setMaximumDiscount] = useState(initialCoupon?.maximumDiscount ?? '');
  const [startsAt, setStartsAt] = useState(
    initialCoupon ? toDateTimeLocalValue(initialCoupon.startsAt) : defaultStartsAtLocal()
  );
  const [expiresAt, setExpiresAt] = useState(
    initialCoupon ? toDateTimeLocalValue(initialCoupon.expiresAt) : defaultExpiresAtLocal()
  );
  const [usageLimit, setUsageLimit] = useState(
    initialCoupon?.usageLimit != null ? String(initialCoupon.usageLimit) : ''
  );
  const [perUserLimit, setPerUserLimit] = useState(
    initialCoupon?.perUserLimit != null ? String(initialCoupon.perUserLimit) : ''
  );
  const [status, setStatus] = useState<CouponStatus>(initialCoupon?.status ?? COUPON_STATUS.ACTIVE);
  const [fieldErrors, setFieldErrors] = useState<CouponFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = isSubmitting;

  const clearField = (field: keyof CouponFieldErrors) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): CouponFieldErrors => {
    const next: CouponFieldErrors = {};
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      next.code = 'Coupon code is required';
    } else if (normalizedCode.length < COUPON_CONSTRAINTS.CODE_MIN) {
      next.code = `Coupon code must be at least ${COUPON_CONSTRAINTS.CODE_MIN} characters`;
    } else if (normalizedCode.length > COUPON_CONSTRAINTS.CODE_MAX) {
      next.code = `Coupon code cannot exceed ${COUPON_CONSTRAINTS.CODE_MAX} characters`;
    } else if (!COUPON_CONSTRAINTS.CODE_PATTERN.test(normalizedCode)) {
      next.code = 'Coupon code may contain letters, numbers, and hyphens only';
    }

    const discountError = validateMoney(discountValue, 'Discount value');
    if (!discountValue.trim()) {
      next.discountValue = 'Discount value is required';
    } else if (discountError) {
      next.discountValue = discountError;
    } else if (
      discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE &&
      Number(discountValue) > COUPON_CONSTRAINTS.PERCENTAGE_MAX
    ) {
      next.discountValue = `Percentage discount cannot exceed ${COUPON_CONSTRAINTS.PERCENTAGE_MAX}`;
    }

    if (scope === COUPON_SCOPE.PRODUCT && selectedProducts.length === 0) {
      next.products = 'Select at least one product';
    } else if (scope === COUPON_SCOPE.PRODUCT && selectedProducts.length > COUPON_CONSTRAINTS.MAX_MAPPINGS) {
      next.products = `A coupon cannot target more than ${COUPON_CONSTRAINTS.MAX_MAPPINGS} products`;
    }

    if (scope === COUPON_SCOPE.CATEGORY && selectedCategoryIds.length === 0) {
      next.categories = 'Select at least one category';
    } else if (scope === COUPON_SCOPE.CATEGORY && selectedCategoryIds.length > COUPON_CONSTRAINTS.MAX_MAPPINGS) {
      next.categories = `A coupon cannot target more than ${COUPON_CONSTRAINTS.MAX_MAPPINGS} categories`;
    }

    const minError = validateMoney(minimumCartValue, 'Minimum cart value', { allowZero: true });
    if (minError) {
      next.minimumCartValue = minError;
    }

    const maxError = validateMoney(maximumDiscount, 'Maximum discount');
    if (maxError) {
      next.maximumDiscount = maxError;
    }

    if (!startsAt) {
      next.startsAt = 'Start date is required';
    }

    if (!expiresAt) {
      next.expiresAt = 'Expiry date is required';
    } else if (startsAt && new Date(startsAt) >= new Date(expiresAt)) {
      next.expiresAt = 'Expiry date must be after the start date';
    }

    const totalLimit = parseOptionalInteger(usageLimit);
    if (usageLimit.trim() && totalLimit === undefined) {
      next.usageLimit = 'Total usage limit must be a whole number';
    } else if (totalLimit != null && totalLimit < 1) {
      next.usageLimit = 'Total usage limit must be at least 1';
    }

    const userLimit = parseOptionalInteger(perUserLimit);
    if (perUserLimit.trim() && userLimit === undefined) {
      next.perUserLimit = 'Per-user usage limit must be a whole number';
    } else if (userLimit != null && userLimit < 1) {
      next.perUserLimit = 'Per-user usage limit must be at least 1';
    }

    return next;
  };

  const sharedFields = useMemo(() => {
    const fields: {
      minimumCartValue?: string | null;
      maximumDiscount?: string | null;
      usageLimit?: number | null;
      perUserLimit?: number | null;
    } = {};

    fields.minimumCartValue = minimumCartValue.trim() ? normalizeMoney(minimumCartValue.trim()) : null;
    fields.maximumDiscount = maximumDiscount.trim() ? normalizeMoney(maximumDiscount.trim()) : null;
    fields.usageLimit = parseOptionalInteger(usageLimit) ?? null;
    fields.perUserLimit = parseOptionalInteger(perUserLimit) ?? null;

    return fields;
  }, [minimumCartValue, maximumDiscount, usageLimit, perUserLimit]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const nextFieldErrors = validate();
    setFieldErrors(nextFieldErrors);

    if (Object.keys(nextFieldErrors).length > 0) {
      return;
    }

    const startsAtIso = fromDateTimeLocalValue(startsAt);
    const expiresAtIso = fromDateTimeLocalValue(expiresAt);

    try {
      if (mode === 'create') {
        const base = {
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: normalizeMoney(discountValue.trim()),
          startsAt: startsAtIso,
          expiresAt: expiresAtIso,
          status,
          ...sharedFields,
        };

        let payload: CreateCouponPayload;
        if (scope === COUPON_SCOPE.PRODUCT) {
          payload = { ...base, scope: 'PRODUCT', productIds: selectedProducts.map((product) => product.id) };
        } else if (scope === COUPON_SCOPE.CATEGORY) {
          payload = { ...base, scope: 'CATEGORY', categoryIds: selectedCategoryIds };
        } else {
          payload = { ...base, scope: 'CART' };
        }

        await onCreate?.(payload);
        return;
      }

      const payload: UpdateCouponPayload = {
        minimumCartValue: sharedFields.minimumCartValue,
        maximumDiscount: sharedFields.maximumDiscount,
        startsAt: startsAtIso,
        expiresAt: expiresAtIso,
        usageLimit: sharedFields.usageLimit,
        perUserLimit: sharedFields.perUserLimit,
        status,
      };

      if (!coreLocked) {
        payload.code = code.trim().toUpperCase();
        payload.discountType = discountType;
        payload.discountValue = normalizeMoney(discountValue.trim());
        payload.scope = scope;
      }

      if (scope === COUPON_SCOPE.PRODUCT) {
        payload.productIds = selectedProducts.map((product) => product.id);
      } else if (scope === COUPON_SCOPE.CATEGORY) {
        payload.categoryIds = selectedCategoryIds;
      }

      await onUpdate?.(payload);
    } catch (err) {
      const mapped = fieldErrorsFromApi(err);
      if (Object.keys(mapped).length > 0) {
        setFieldErrors(mapped);
      }

      if (err instanceof ApiError && !mapped.code && err.statusCode === 409) {
        setFieldErrors({ code: err.message });
      }
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="flex max-w-3xl flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Basic</h2>
        <Input
          label="Coupon code"
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase());
            clearField('code');
          }}
          maxLength={COUPON_CONSTRAINTS.CODE_MAX}
          required
          disabled={isBusy || coreLocked}
          error={fieldErrors.code}
          helperText={
            coreLocked
              ? 'Code cannot change after the coupon has been used.'
              : 'Letters, numbers, and hyphens. Stored uppercase.'
          }
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Discount</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Discount type"
            value={discountType}
            onChange={(event) => {
              setDiscountType(event.target.value as CouponDiscountType);
              clearField('discountType');
              clearField('discountValue');
            }}
            disabled={isBusy || coreLocked}
            required
            error={fieldErrors.discountType}
            options={[
              { value: COUPON_DISCOUNT_TYPE.PERCENTAGE, label: 'Percentage' },
              { value: COUPON_DISCOUNT_TYPE.FIXED_AMOUNT, label: 'Fixed amount' },
            ]}
          />
          <Input
            label="Discount value"
            value={discountValue}
            onChange={(event) => {
              setDiscountValue(event.target.value);
              clearField('discountValue');
            }}
            required
            disabled={isBusy || coreLocked}
            error={fieldErrors.discountValue}
            inputMode="decimal"
            placeholder={discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE ? '20' : '500.00'}
            helperText={
              discountType === COUPON_DISCOUNT_TYPE.PERCENTAGE
                ? `Greater than 0, up to ${COUPON_CONSTRAINTS.PERCENTAGE_MAX}.`
                : 'Greater than 0. Amount in rupees.'
            }
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Scope</h2>
        <Select
          label="Scope"
          value={scope}
          onChange={(event) => {
            setScope(event.target.value as CouponScope);
            clearField('scope');
            clearField('products');
            clearField('categories');
          }}
          disabled={isBusy || coreLocked}
          required
          error={fieldErrors.scope}
          helperText={
            coreLocked
              ? 'Scope cannot change after the coupon has been used. Eligible products or categories can still be updated.'
              : 'Product-scoped coupons apply to every variant of the selected products.'
          }
          options={[
            { value: COUPON_SCOPE.CART, label: 'Entire cart' },
            { value: COUPON_SCOPE.PRODUCT, label: 'Specific products' },
            { value: COUPON_SCOPE.CATEGORY, label: 'Specific categories' },
          ]}
        />

        {scope === COUPON_SCOPE.PRODUCT && (
          <CouponProductSelector
            selected={selectedProducts}
            disabled={isBusy}
            error={fieldErrors.products}
            onChange={(next) => {
              setSelectedProducts(next);
              clearField('products');
            }}
          />
        )}

        {scope === COUPON_SCOPE.CATEGORY && (
          <CouponCategorySelector
            selectedIds={selectedCategoryIds}
            disabled={isBusy}
            error={fieldErrors.categories}
            onChange={(next) => {
              setSelectedCategoryIds(next);
              clearField('categories');
            }}
          />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Conditions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Minimum cart value"
            value={minimumCartValue}
            onChange={(event) => {
              setMinimumCartValue(event.target.value);
              clearField('minimumCartValue');
            }}
            disabled={isBusy}
            error={fieldErrors.minimumCartValue}
            inputMode="decimal"
            placeholder="3000.00"
            helperText="Leave blank for no minimum. The Backend checks the full cart subtotal."
          />
          <Input
            label="Maximum discount"
            value={maximumDiscount}
            onChange={(event) => {
              setMaximumDiscount(event.target.value);
              clearField('maximumDiscount');
            }}
            disabled={isBusy}
            error={fieldErrors.maximumDiscount}
            inputMode="decimal"
            placeholder="500.00"
            helperText="Optional cap on the calculated discount. Applies to percentage and fixed coupons."
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Validity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="datetime-local"
            value={startsAt}
            onChange={(event) => {
              setStartsAt(event.target.value);
              clearField('startsAt');
              clearField('expiresAt');
            }}
            required
            disabled={isBusy}
            error={fieldErrors.startsAt}
          />
          <Input
            label="Expiry date"
            type="datetime-local"
            value={expiresAt}
            onChange={(event) => {
              setExpiresAt(event.target.value);
              clearField('expiresAt');
            }}
            required
            disabled={isBusy}
            error={fieldErrors.expiresAt}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Usage</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Total usage limit"
            value={usageLimit}
            onChange={(event) => {
              setUsageLimit(event.target.value);
              clearField('usageLimit');
            }}
            disabled={isBusy}
            error={fieldErrors.usageLimit}
            inputMode="numeric"
            placeholder="1000"
            helperText="Leave blank for unlimited redemptions."
          />
          <Input
            label="Per-user usage limit"
            value={perUserLimit}
            onChange={(event) => {
              setPerUserLimit(event.target.value);
              clearField('perUserLimit');
            }}
            disabled={isBusy}
            error={fieldErrors.perUserLimit}
            inputMode="numeric"
            placeholder="1"
            helperText="Leave blank for no per-user cap."
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-text">Status</h2>
        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as CouponStatus)}
          disabled={isBusy}
          options={[
            { value: COUPON_STATUS.ACTIVE, label: 'Active' },
            { value: COUPON_STATUS.INACTIVE, label: 'Inactive' },
          ]}
        />
      </section>

      <FormError message={formError || error} />

      <FormActions>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isBusy}>
          {mode === 'create' ? 'Save coupon' : 'Save changes'}
        </Button>
      </FormActions>
    </form>
  );
}
