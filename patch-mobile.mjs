#!/usr/bin/env node
/**
 * Applies the mobile-compatibility upgrade to your scaffold.mjs.
 * Usage:  node patch-mobile.mjs [path/to/scaffold.mjs]
 * - Makes a backup (scaffold.mjs.bak) first.
 * - Safe to run twice (it skips what is already applied).
 * - If it cannot find a place to edit, it tells you and changes nothing.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';

const file = process.argv[2] || 'scaffold.mjs';
if (!existsSync(file)) { console.error('Cannot find ' + file + '. Run this next to scaffold.mjs or pass its path.'); process.exit(1); }
let src = readFileSync(file, 'utf8');
const original = src;
const EOL = src.includes('\r\n') ? '\r\n' : '\n'; // keep your file's line endings (Windows or Mac/Linux)

const MARK = '/* ===== mobile and older-browser hardening ===== */';

const CSS = String.raw`
${MARK}
html{overflow-x:hidden;text-size-adjust:100%}
body{min-width:320px;overflow-wrap:break-word;word-wrap:break-word}
img,svg,video{max-width:100%}
img{height:auto}
.shell{min-height:100vh;min-height:100dvh}
h1{font-size:1.9rem;font-size:clamp(1.6rem,5.2vw,2.5rem)}

/* stop grids forcing sideways scroll on narrow screens */
.main,.page,.panel,.card,.item,.member,.mini .grow,.row>.field,.split>*,.two>*,.grid>*,.proj-grid>*,.team-grid>*,.quotes>*{min-width:0}
.two{grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))}
.team-grid{grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))}
.quotes{grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr))}
th,td{word-break:break-word}

/* old-browser fallbacks (inset, aspect-ratio) */
.scrim{top:0;left:0;right:0;bottom:0;touch-action:none}
@supports not (aspect-ratio:1/1){
  .proj-cover{height:0;padding-top:75%}
  .proj-cover img{position:absolute;left:0;top:0}
}

/* form controls: same look on iPhone and Android, easy to tap */
.input,select,textarea{-webkit-appearance:none;appearance:none;border-radius:10px;max-width:100%;min-height:46px}
textarea{min-height:110px}
select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23a69e8a' stroke-width='2'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;background-size:12px 8px;padding-right:34px}
input[type=date]{display:block;min-width:0;width:100%}
input[type=file]{max-width:100%;width:100%;font-size:14px}
::-webkit-date-and-time-value{text-align:left}
.check input{width:20px;height:20px;flex:none}
.adm .panel{overflow-x:auto;-webkit-overflow-scrolling:touch}
.tabs{scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}

@media (max-width:820px){
  .side{width:min(300px,86vw);overscroll-behavior:contain}
  .recents,.msgs{overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
  /* notches and rounded corners */
  .topbar{padding-top:calc(10px + env(safe-area-inset-top));padding-left:max(14px,env(safe-area-inset-left));padding-right:max(14px,env(safe-area-inset-right))}
  .page,.adm{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}
  .site-foot{padding-left:max(16px,env(safe-area-inset-left));padding-right:max(16px,env(safe-area-inset-right))}
  .tabbar{padding-left:env(safe-area-inset-left);padding-right:env(safe-area-inset-right)}
  .side-foot{padding-bottom:calc(10px + env(safe-area-inset-bottom))}
  /* chat fits the screen and works with the keyboard open */
  .chat{height:calc(100vh - 230px);height:calc(100dvh - 230px);min-height:340px;max-height:640px}
  .hero .btn{width:100%}
  .tab{min-height:44px;padding:12px 16px}
  .mini{align-items:flex-start}
  .wa{width:48px;height:48px;padding:0;justify-content:center;right:max(16px,env(safe-area-inset-right))}
}

/* small phones (320 to 380px) */
@media (max-width:380px){
  body{font-size:14px}
  .page{padding-top:18px;padding-bottom:36px}
  .card,.panel,.member{padding:16px}
  .pricetag .amt{font-size:1.15rem}
  .tb{font-size:.64rem}
  .certs,.sf-grid{grid-template-columns:1fr}
}

/* phones held sideways */
@media (max-height:480px) and (orientation:landscape){
  .tb{min-height:46px}
  .main{padding-bottom:calc(52px + env(safe-area-inset-bottom))}
  .chat{min-height:260px}
}
`;

const SHELL_EFFECTS = String.raw`useEffect(() => setOpen(false), [path]);
  // freeze the page behind the open menu, close it on Escape, and close it if the phone is rotated to a wide layout
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [open]);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 821px)');
    const f = () => { if (mq.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener('change', f); else mq.addListener(f);
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', f); else mq.removeListener(f); };
  }, []);`;

const done = [], skipped = [], failed = [];

function replaceOnce(label, find, repl, alreadyMarker) {
  if (src.includes(alreadyMarker)) { skipped.push(label + ' (already applied)'); return; }
  const first = src.indexOf(find);
  if (first === -1) { failed.push(label + ': could not find the text to change'); return; }
  if (src.indexOf(find, first + 1) !== -1) { failed.push(label + ': the text appears more than once, not changing it'); return; }
  src = src.slice(0, first) + repl.replace(/\r?\n/g, EOL) + src.slice(first + find.length);
  done.push(label);
}

// 1. CSS: add at the end of the app/globals.css block
{
  const anchor = '@media (prefers-reduced-motion:reduce){*{transition:none!important}}';
  replaceOnce('CSS hardening block', anchor, anchor + CSS.replace(/\n$/, ''), MARK);
}

// 2. Viewport (notch support, dark form controls)
replaceOnce(
  'Viewport settings',
  "export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#14120e' };",
  "export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#14120e', colorScheme: 'dark' };",
  "viewportFit: 'cover'"
);

// 3. Shell: scroll lock, Escape, rotate-to-close
replaceOnce(
  'Menu scroll lock and rotate handling',
  'useEffect(() => setOpen(false), [path]);',
  SHELL_EFFECTS,
  'freeze the page behind the open menu'
);

// 4. Menu button accessibility
replaceOnce(
  'Menu button aria-expanded',
  '<button className="tb" onClick={() => setOpen(true)} aria-label="Open menu">',
  '<button className="tb" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>',
  'aria-label="Open menu" aria-expanded={open}'
);

if (failed.length) {
  console.error('Nothing was written. Problems:');
  failed.forEach((x) => console.error('  - ' + x));
  console.error('\nSend me the lines around that spot in your scaffold.mjs and I will adjust the patch.');
  process.exit(1);
}
if (src === original) { console.log('Nothing to do. Already patched:\n  ' + skipped.join('\n  ')); process.exit(0); }

copyFileSync(file, file + '.bak');
writeFileSync(file, src);
console.log('Patched ' + file + ' (backup saved as ' + file + '.bak).');
done.forEach((x) => console.log('  + ' + x));
skipped.forEach((x) => console.log('  = ' + x));
console.log('\nNext: node ' + file + ' . --force   (then npm run dev, and test on your phone)');
