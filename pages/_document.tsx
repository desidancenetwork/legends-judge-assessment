import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link
            rel="preload"
            href="/fonts/PontiacInlineShadow.otf"
            as="font"
            type="font/opentype"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            href="/fonts/Graphik-Regular.otf"
            as="font"
            type="font/opentype"
            crossOrigin="anonymous"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument