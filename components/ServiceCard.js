import Link from 'next/link';
import { svcPath } from '@/lib/text';

// s comes from SERVICE_SELECT (service + its category).
export default function ServiceCard({ s }) {
  const pro = s.cat_kind === 'professional';
  return (
    <article className={'card acc-' + s.cat_accent}>
      {!pro && s.sticker_on && <span className="sticker">{s.sticker_text || 'Offer'}</span>}
      <div className="card-top">
        <span className="card-ic">{s.cat_icon}</span>
        <span className="mute small">{s.cat_label}</span>
      </div>
      <h3><Link href={svcPath(s)}>{s.title}</Link></h3>
      <p>{s.description}</p>
      <div className="pricetag">
        <span className="amt">{Number(s.price).toLocaleString('en-US')}</span>
        <span className="cur">{s.currency}</span>
        <span className="unit">{s.unit}</span>
      </div>
      <Link className="btn gold" href={(pro ? '/e/' : '/b/') + s.id}>
        {pro ? 'Request engagement' : 'Start a brief'}
      </Link>
      {pro && <Link href="/code" className="small mute" style={{ marginTop: 10 }}>Read the terms of conduct first</Link>}
    </article>
  );
}
