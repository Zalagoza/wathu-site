export default function manifest() {
  return {
    name: 'Wathu Digital Creations',
    short_name: 'Wathu Digital',
    description: 'Graphic design, web design, photography, videography, digital forensics, cybersecurity and ICT support.',
    start_url: '/',
    display: 'standalone',
    background_color: '#14120e',
    theme_color: '#14120e',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
