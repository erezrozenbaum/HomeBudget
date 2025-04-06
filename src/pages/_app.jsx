import React from 'react';
import Layout from '../layout';
import '../index.css';

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}