'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';

interface CouponCodeProps {
  code: string;
}

export function CouponCode({ code }: CouponCodeProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-sm font-medium tracking-wide text-text">{code}</span>
      <Button type="button" variant="ghost" size="sm" onClick={() => void handleCopy()} aria-label={`Copy ${code}`}>
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </span>
  );
}
