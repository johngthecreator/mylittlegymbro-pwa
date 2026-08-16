export function isMobileUserAgent(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /Android/i.test(ua) ||
    /iPhone|iPod/i.test(ua) ||
    /iPad/i.test(ua) ||
    /Mobile/i.test(ua) ||
    /Opera Mini/i.test(ua) ||
    /IEMobile/i.test(ua) ||
    /Windows Phone/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}
