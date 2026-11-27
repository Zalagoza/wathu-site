import { q } from '@/lib/db';

export const FOOTER_DEFAULT = {
  about: 'Graphic design, web design, photography, videography, digital forensics, cybersecurity and ICT support.',
  address: '', phone: '', email: '', whatsapp: '',
  social: {},
  copyright: 'Wathu Digital Creations. All rights reserved.',
};

// The footer is edited in the admin (Footer tab) and kept in the settings table.
export async function getFooter() {
  try {
    const rows = await q("select value from settings where key = 'footer'");
    let v = rows[0] && rows[0].value;
    if (typeof v === 'string') v = JSON.parse(v);
    return v ? { ...FOOTER_DEFAULT, ...v, social: { ...(v.social || {}) } } : FOOTER_DEFAULT;
  } catch (e) {
    console.error('Footer query failed:', e.message);
    return FOOTER_DEFAULT;
  }
}
