import React from 'react';
import Layout from '../layout';
import '../globals.css';

export default function App({ Component, pageProps, router }) {
  const currentPageName = router.pathname.split('/')[1] || 'Dashboard';
  
  return (
    <Layout currentPageName={currentPageName}>
      <Component {...pageProps} />
    </Layout>
  );
}