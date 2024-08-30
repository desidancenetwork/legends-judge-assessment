import type { AppProps } from 'next/app';
import { SessionProvider } from "next-auth/react";
import { AssessmentProvider } from '../contexts/AssessmentContext';
import Layout from '../components/Layout';
import '../styles/globals.css';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AssessmentProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AssessmentProvider>
    </SessionProvider>
  );
}

export default MyApp;