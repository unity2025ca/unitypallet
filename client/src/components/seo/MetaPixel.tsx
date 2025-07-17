import { useEffect } from 'react';

// Facebook Pixel tracking component
export function MetaPixel() {
  useEffect(() => {
    // Facebook Pixel Code
    const pixelCode = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', 'YOUR_PIXEL_ID'); // Replace with actual pixel ID
      fbq('track', 'PageView');
    `;
    
    // Only load in production
    if (process.env.NODE_ENV === 'production') {
      const script = document.createElement('script');
      script.innerHTML = pixelCode;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}

// Google Analytics tracking component
export function GoogleAnalytics() {
  useEffect(() => {
    // Google Analytics Code
    const trackingId = 'GA_MEASUREMENT_ID'; // Replace with actual tracking ID
    
    if (process.env.NODE_ENV === 'production') {
      // Load gtag script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      document.head.appendChild(script1);
      
      // Initialize gtag
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${trackingId}');
      `;
      document.head.appendChild(script2);
    }
  }, []);

  return null;
}