export default function WhatsAppButton() {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP || '265996103277').replace(/\D/g, '');
  const text = encodeURIComponent('Hello Wathu Digital Creations, I would like to ask about your services.');
  return (
    <a className="wa" href={'https://wa.me/' + number + '?text=' + text} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" /></svg>
      <span>Chat on WhatsApp</span>
    </a>
  );
}
