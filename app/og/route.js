import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(req) {
  const sp = new URL(req.url).searchParams;
  const t = (sp.get('t') || 'Wathu Digital Creations').slice(0, 90);
  const s = (sp.get('s') || 'Design, media and digital security').slice(0, 110);
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#14120e', color: '#efe9da', padding: '64px 72px' }}>
        <div style={{ display: 'flex', height: 10, width: 260 }}>
          <div style={{ flex: 1, background: '#2e9c5a' }} />
          <div style={{ flex: 1, background: '#dcab32' }} />
          <div style={{ flex: 1, background: '#c7482f' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: t.length > 45 ? 56 : 72, fontWeight: 700, lineHeight: 1.12 }}>{t}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#dcab32', marginTop: 24 }}>{s}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 30, color: '#a69e8a' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 54, height: 54, borderRadius: 12, border: '2px solid #2f2b22', background: '#211e18', color: '#dcab32', fontSize: 34, marginRight: 18 }}>W</div>
          Wathu Digital Creations
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
