const DEFAULT_CLOUD_NAME = 'dnlatyl5z';

/**
 * Report `photos` may be full Cloudinary URLs or legacy public IDs / filenames only.
 * Relative-looking values are resolved against Cloudinary delivery URLs.
 */
export function resolveReportPhotoUrl(src: string | undefined | null): string {
  if (src == null || typeof src !== 'string') return '';
  const s = src.trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith('data:')) return s;
  const cloud =
    (typeof import.meta !== 'undefined' &&
      import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME) ||
    DEFAULT_CLOUD_NAME;
  const path = s.replace(/^\/+/, '');
  return `https://res.cloudinary.com/${cloud}/image/upload/${path}`;
}
