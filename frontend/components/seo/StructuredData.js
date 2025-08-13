"use client";

import { useEffect } from 'react';

const StructuredData = ({ data, type = 'application/ld+json' }) => {
  useEffect(() => {
    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[data-structured-data]');
    existingScripts.forEach(script => script.remove());

    // Add new structured data
    if (data) {
      const script = document.createElement('script');
      script.type = type;
      script.setAttribute('data-structured-data', 'true');
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    }
  }, [data, type]);

  // For SSR, render the script tag
  if (data) {
    return (
      <script
        type={type}
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(data)
        }}
      />
    );
  }

  return null;
};

export default StructuredData;
