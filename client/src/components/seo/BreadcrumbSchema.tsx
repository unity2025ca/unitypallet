import { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  useEffect(() => {
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": `https://jaberco.com${item.url}`
      }))
    };

    // Remove existing breadcrumb schema
    const existingScript = document.querySelector('script[type="application/ld+json"][data-breadcrumb="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new breadcrumb schema
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(breadcrumbData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-breadcrumb="true"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [items]);

  return null;
}

// Visual breadcrumb component
export function VisualBreadcrumb({ items }: BreadcrumbSchemaProps) {
  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-500 font-medium">{item.name}</span>
            ) : (
              <a href={item.url} className="text-blue-600 hover:text-blue-800 font-medium">
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}