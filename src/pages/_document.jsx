import React from 'react';
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Check for saved theme preference or system preference
              const storedTheme = localStorage.getItem('theme');
              const theme = storedTheme || 'system';
              const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              
              // Apply dark mode immediately if needed
              if (theme === 'dark' || (theme === 'system' && systemPrefersDark)) {
                document.documentElement.classList.add('dark');
              }
            })();
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}