import { q } from '@/lib/db';

// Services joined with their category. cat_kind = 'professional' means the private engagement flow
// (terms of conduct, letter of engagement, no promotion sticker). cat_refs = required | optional | none.
export const SERVICE_SELECT =
  'select s.*, c.label as cat_label, c.icon as cat_icon, c.kind as cat_kind, c.refs as cat_refs, c.accent as cat_accent from services s join categories c on c.slug = s.category';

export const getCats = (all = false) =>
  q('select * from categories ' + (all ? '' : 'where active ') + 'order by sort, id');

export const isPro = (s) => s && s.cat_kind === 'professional';
