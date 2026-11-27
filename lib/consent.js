// Cookie choice, kept in a small cookie called wdc_consent ("yes" or "no") for 6 months. Client side only.
export function getConsent() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|; )wdc_consent=(yes|no)/);
  return m ? m[1] : null;
}

export function setConsent(v) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = 'wdc_consent=' + v + '; Path=/; Max-Age=15552000; SameSite=Lax' + secure;
  if (v !== 'yes') document.cookie = 'wdc_vid=; Path=/; Max-Age=0; SameSite=Lax'; // forget the visitor id
  window.dispatchEvent(new Event('wdc-consent'));
}
