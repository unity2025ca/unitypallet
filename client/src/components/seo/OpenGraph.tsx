import { useEffect } from 'react';

interface OpenGraphProps {
  title: string;
  description: string;
  image: string;
  url: string;
  type?: string;
  siteName?: string;
  locale?: string;
  price?: string;
  currency?: string;
  availability?: string;
}

export function OpenGraph({
  title,
  description,
  image,
  url,
  type = 'website',
  siteName = 'Jaberco Liquidation',
  locale = 'en_CA',
  price,
  currency = 'CAD',
  availability = 'instock'
}: OpenGraphProps) {
  useEffect(() => {
    const setMetaProperty = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Basic Open Graph tags
    setMetaProperty('og:title', title);
    setMetaProperty('og:description', description);
    setMetaProperty('og:image', image);
    setMetaProperty('og:url', url);
    setMetaProperty('og:type', type);
    setMetaProperty('og:site_name', siteName);
    setMetaProperty('og:locale', locale);
    
    // Product-specific Open Graph tags
    if (type === 'product' && price) {
      setMetaProperty('product:price:amount', price);
      setMetaProperty('product:price:currency', currency);
      setMetaProperty('product:availability', availability);
    }
    
    // Additional Open Graph tags for better social sharing
    setMetaProperty('og:image:width', '1200');
    setMetaProperty('og:image:height', '630');
    setMetaProperty('og:image:alt', title);
    
    // Twitter Card tags
    setMetaProperty('twitter:card', 'summary_large_image');
    setMetaProperty('twitter:title', title);
    setMetaProperty('twitter:description', description);
    setMetaProperty('twitter:image', image);
    setMetaProperty('twitter:image:alt', title);
    
    // Additional Twitter tags
    setMetaProperty('twitter:site', '@JabercoLiquidation');
    setMetaProperty('twitter:creator', '@JabercoLiquidation');
    
  }, [title, description, image, url, type, siteName, locale, price, currency, availability]);

  return null;
}