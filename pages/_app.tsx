import { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
import MetaPixel from '../components/MetaPixel';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
      <MetaPixel />
    </>
  );
}