/**
 * Safe Object URL Lifecycle Utilities
 * Prevents memory leaks by revoking created object URLs while avoiding double-cleanup errors.
 */
export function safeRevokeUrl(url?: string | null): void {
  if (!url) return;
  if (typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('Gagal mencabut Object URL:', e);
    }
  }
}
