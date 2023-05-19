import { SessionProvider } from 'next-auth/react'
import LanguageProvider from '../context/language-context'
import AppLayout from '../layouts/AppLayout'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </LanguageProvider>
    </SessionProvider>
  )
}

export default MyApp
