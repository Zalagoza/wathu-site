import Link from 'next/link';

export default function NotFoundView() {
  return (
    <div className="page narrow">
      <h1>Page not found</h1>
      <p className="mute">The page you are looking for may have moved or no longer exists. Here are some good places to go next.</p>
      <div className="row">
        <Link href="/" className="btn gold">Home</Link>
        <Link href="/work" className="btn">Browse services</Link>
        <Link href="/folio" className="btn">Our work</Link>
      </div>
    </div>
  );
}
