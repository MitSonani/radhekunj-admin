/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  bannerService,
  type AdminBannerItem,
  type CreateBannerPayload,
  type UpdateBannerPayload,
} from '@/services/api/banners';

export function BannersView() {
  const [banners, setBanners] = useState<AdminBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdminBannerItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Form Fields
  const [formData, setFormData] = useState<CreateBannerPayload>({
    title: '',
    subtitle: '',
    badgeText: '',
    ctaLabel: 'Explore Collection',
    ctaLink: '/products',
    desktopImageUrl: '',
    tabletImageUrl: '',
    mobileImageUrl: '',
    altText: '',
    textAlignment: 'left',
    isActive: true,
    sortOrder: 0,
  });

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const fetchBanners = async () => {
      try {
        const data = await bannerService.listBanners();
        if (!isCancelled) {
          setBanners(data);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load banners');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    void fetchBanners();

    return () => {
      isCancelled = true;
    };
  }, [reloadKey]);

  const loadBanners = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      badgeText: '',
      ctaLabel: 'Explore Collection',
      ctaLink: '/products',
      desktopImageUrl: '',
      tabletImageUrl: '',
      mobileImageUrl: '',
      altText: '',
      textAlignment: 'left',
      isActive: true,
      sortOrder: banners.length,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: AdminBannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      badgeText: banner.badgeText ?? '',
      ctaLabel: banner.ctaLabel ?? '',
      ctaLink: banner.ctaLink ?? '',
      desktopImageUrl: banner.desktopImageUrl,
      tabletImageUrl: banner.tabletImageUrl ?? '',
      mobileImageUrl: banner.mobileImageUrl ?? '',
      altText: banner.altText,
      textAlignment: banner.textAlignment,
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!formData.desktopImageUrl.trim()) {
      setFormError('Desktop image URL is required');
      return;
    }
    if (!formData.altText.trim()) {
      setFormError('Alt text is required for accessibility');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingBanner) {
        const payload: UpdateBannerPayload = {
          ...formData,
          subtitle: formData.subtitle?.trim() || null,
          badgeText: formData.badgeText?.trim() || null,
          ctaLabel: formData.ctaLabel?.trim() || null,
          ctaLink: formData.ctaLink?.trim() || null,
          tabletImageUrl: formData.tabletImageUrl?.trim() || null,
          mobileImageUrl: formData.mobileImageUrl?.trim() || null,
        };
        await bannerService.updateBanner(editingBanner.id, payload);
      } else {
        const payload: CreateBannerPayload = {
          ...formData,
          subtitle: formData.subtitle?.trim() || null,
          badgeText: formData.badgeText?.trim() || null,
          ctaLabel: formData.ctaLabel?.trim() || null,
          ctaLink: formData.ctaLink?.trim() || null,
          tabletImageUrl: formData.tabletImageUrl?.trim() || null,
          mobileImageUrl: formData.mobileImageUrl?.trim() || null,
        };
        await bannerService.createBanner(payload);
      }
      setIsModalOpen(false);
      await loadBanners();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: AdminBannerItem) => {
    if (!window.confirm(`Are you sure you want to delete banner "${banner.title}"?`)) {
      return;
    }
    try {
      await bannerService.deleteBanner(banner.id);
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (banner: AdminBannerItem) => {
    try {
      await bannerService.updateBanner(banner.id, { isActive: !banner.isActive });
      await loadBanners();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Homepage Hero Banners"
          description="Manage responsive desktop, tablet, and mobile marketing banners for the storefront hero section."
          breadcrumbs={[{ label: 'Admin', href: '/dashboard' }, { label: 'Banners' }]}
        />
        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          + Create Banner
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger-soft p-4 text-xs text-danger">
          {error}
        </div>
      )}

      {/* Banners List */}
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text">Configured Banners</h2>
          <span className="text-xs text-text-muted">{banners.length} total banners</span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded border border-border bg-surface-muted/50" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="py-12 text-center text-xs text-text-muted">
            No banners found. Click &quot;Create Banner&quot; to configure your first responsive hero banner.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-secondary">
                  <th className="py-2.5 font-medium">Order</th>
                  <th className="py-2.5 font-medium">Preview</th>
                  <th className="py-2.5 font-medium">Title &amp; Badge</th>
                  <th className="py-2.5 font-medium">Breakpoints</th>
                  <th className="py-2.5 font-medium">CTA Link</th>
                  <th className="py-2.5 font-medium">Status</th>
                  <th className="py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-muted/20 transition-colors">
                    <td className="py-3 font-mono text-text-secondary">{b.sortOrder}</td>
                    <td className="py-3">
                      <div className="h-12 w-20 overflow-hidden rounded border border-border bg-surface-muted">
                        <img
                          src={b.desktopImageUrl}
                          alt={b.altText}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-text">{b.title}</div>
                      {b.badgeText && (
                        <span className="inline-block mt-0.5 text-[10px] font-medium text-primary">
                          [{b.badgeText}]
                        </span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-primary-soft px-1.5 py-0.5 text-[10px] font-mono text-primary">
                          Desktop
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                            b.tabletImageUrl
                              ? 'bg-primary-soft text-primary'
                              : 'bg-surface-muted text-text-muted'
                          }`}
                        >
                          Tablet {b.tabletImageUrl ? '✓' : '—'}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                            b.mobileImageUrl
                              ? 'bg-primary-soft text-primary'
                              : 'bg-surface-muted text-text-muted'
                          }`}
                        >
                          Mobile {b.mobileImageUrl ? '✓' : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 font-mono text-text-secondary">
                      {b.ctaLink ? (
                        <span>
                          {b.ctaLabel || 'CTA'} &rarr; {b.ctaLink}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => void handleToggleActive(b)}
                        className="cursor-pointer"
                      >
                        {b.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="muted">Inactive</Badge>
                        )}
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(b)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => void handleDelete(b)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBanner ? 'Edit Hero Banner' : 'Create Hero Banner'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded border border-danger/30 bg-danger-soft p-3 text-xs text-danger">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-text-secondary">
                Title / Headline *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                placeholder="The Art of Quiet Luxury"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">
                Badge Accent Text
              </label>
              <input
                type="text"
                value={formData.badgeText ?? ''}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                placeholder="Artisan Heritage Edit"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary">Subtitle / Description</label>
            <textarea
              value={formData.subtitle ?? ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
              placeholder="Structured silhouettes, natural organic fabrics, and a neutral palette..."
            />
          </div>

          {/* CTA & Positioning */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary">CTA Button Label</label>
              <input
                type="text"
                value={formData.ctaLabel ?? ''}
                onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                placeholder="Explore Collection"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">CTA Destination URL</label>
              <input
                type="text"
                value={formData.ctaLink ?? ''}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                placeholder="/products"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary">Text Alignment</label>
              <select
                value={formData.textAlignment ?? 'left'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    textAlignment: e.target.value as 'left' | 'center' | 'right',
                  })
                }
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
              >
                <option value="left">Left Aligned</option>
                <option value="center">Centered</option>
                <option value="right">Right Aligned</option>
              </select>
            </div>
          </div>

          {/* Responsive Image Assets */}
          <div className="border-t border-border pt-3 space-y-3">
            <h3 className="text-xs font-semibold text-text">Responsive Image Assets</h3>
            <div>
              <label className="block text-xs font-medium text-text-secondary">
                Desktop Image URL (1024px+) *
              </label>
              <input
                type="url"
                value={formData.desktopImageUrl}
                onChange={(e) => setFormData({ ...formData, desktopImageUrl: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                placeholder="https://.../desktop.webp"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-text-secondary">
                  Tablet Image URL (640px - 1023px)
                </label>
                <input
                  type="url"
                  value={formData.tabletImageUrl ?? ''}
                  onChange={(e) => setFormData({ ...formData, tabletImageUrl: e.target.value })}
                  className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                  placeholder="Optional — falls back to desktop image"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary">
                  Mobile Image URL (&lt; 640px)
                </label>
                <input
                  type="url"
                  value={formData.mobileImageUrl ?? ''}
                  onChange={(e) => setFormData({ ...formData, mobileImageUrl: e.target.value })}
                  className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                  placeholder="Optional — falls back to tablet or desktop"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary">
                Accessible Image Alt Text *
              </label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
                placeholder="Visual description of the hero image for screen readers"
                required
              />
            </div>
          </div>

          {/* Visibility and Sort Order */}
          <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary">Sort Order</label>
              <input
                type="number"
                value={formData.sortOrder ?? 0}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })}
                className="mt-1 w-full rounded border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-primary focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input
                id="isActiveCheck"
                type="checkbox"
                checked={formData.isActive ?? true}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="isActiveCheck" className="text-xs font-medium text-text">
                Active &amp; Visible on Storefront
              </label>
            </div>
          </div>

          {/* Live Responsive Fallback Preview Box */}
          {formData.desktopImageUrl && (
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-text">Responsive Breakpoint Preview</span>
                <div className="flex gap-1 rounded bg-surface-muted p-0.5 text-[10px]">
                  {(['desktop', 'tablet', 'mobile'] as const).map((dev) => (
                    <button
                      key={dev}
                      type="button"
                      onClick={() => setPreviewDevice(dev)}
                      className={`rounded px-2 py-0.5 font-medium uppercase ${
                        previewDevice === dev
                          ? 'bg-surface text-primary font-bold shadow-xs'
                          : 'text-text-muted hover:text-text'
                      }`}
                    >
                      {dev}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className={`mx-auto overflow-hidden rounded border border-border bg-surface-muted transition-all duration-300 relative ${
                  previewDevice === 'mobile'
                    ? 'max-w-[280px] h-[340px]'
                    : previewDevice === 'tablet'
                    ? 'max-w-[460px] h-[260px]'
                    : 'w-full h-[220px]'
                }`}
              >
                <img
                  src={
                    previewDevice === 'mobile'
                      ? formData.mobileImageUrl || formData.tabletImageUrl || formData.desktopImageUrl
                      : previewDevice === 'tablet'
                      ? formData.tabletImageUrl || formData.desktopImageUrl
                      : formData.desktopImageUrl
                  }
                  alt={formData.altText || 'Preview'}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                  {formData.badgeText && (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-accent mb-0.5">
                      {formData.badgeText}
                    </span>
                  )}
                  <div className="text-sm font-serif font-bold leading-tight">
                    {formData.title || 'Headline'}
                  </div>
                  {formData.ctaLabel && (
                    <div className="mt-2">
                      <span className="rounded bg-white px-2 py-0.5 text-[9px] font-bold uppercase text-primary">
                        {formData.ctaLabel}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              disabled={saving}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={saving}>
              {saving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
