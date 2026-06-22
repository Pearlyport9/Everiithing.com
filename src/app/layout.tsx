import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Everiithing\u2022com \u2014 Verified Home & Office Services in Lagos',
  description:
    'Book trusted plumbers, electricians, AC technicians and more. Verified providers, transparent pricing, satisfaction guaranteed.',
  icons: {
    icon: '/favicon-icon.svg',
    apple: '/favicon-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-token-onSurface font-body" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-white focus:text-token-primary focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-token-primary"
        >
          Skip to main content
        </a>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var startX=0,startY=0;
  document.addEventListener("dragstart",function(e){e.preventDefault()});
  document.addEventListener("touchstart",function(e){
    var t=e.changedTouches[0];
    if(t){startX=t.clientX;startY=t.clientY}
  },{passive:true});
  document.addEventListener("touchmove",function(e){
    var t=e.changedTouches[0];
    if(!t)return;
    var el=e.target;
    while(el&&el!==document.body){
      if(el.classList&&el.classList.contains("scrollable-x"))return;
      el=el.parentElement;
    }
    var dx=Math.abs(t.clientX-startX);
    var dy=Math.abs(t.clientY-startY);
    if(dx>dy)e.preventDefault();
  },{passive:false});
})();
`}} />
      </body>
    </html>
  )
}
