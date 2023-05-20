import { useContext, Fragment, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getSession, signIn } from "next-auth/react";
import L10n from "../../L10n.json";
import { LanguageContext } from '../../context/language-context';
import AuthForm from '../../components/auth/AuthForm';
import axios from 'axios';

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState(null); // used when signup is successful
  const router = useRouter();
  const language = useContext(LanguageContext).language;

  const handleAuth = async (email, pass, isLogin, username) => {
    if (!isLogin) {
      try {
        await axios.post("/api/auth/signup", { email: email, password: pass, username: username });
        setIsLoading(false);
        setIsLogin(true);
        setError(null);
        setMessage(L10n[language].account_created_text)
      } catch (e) {
        setError(e.response.data.message || e.response.statusText);
        setIsLoading(false);
      }
    } else {

      const response = await signIn("credentials", {
        redirect: false,
        email: email,
        password: pass
      });
      if (response.ok) {
        router.replace(`/?language=${language}`);
      }else{
        setError(response.error);
        setIsLoading(false);
      }
    }
  }

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Authenticate</title>
        <meta
          name="description"
          content={"This page is dedicated to accessing a user's account."}>
        </meta>
      </Head>
      <div>
        <h1>{L10n[language].authenticate_word}:</h1>
        <div className="belowTitleContent">
          <AuthForm message={message} isLogin={isLogin} setIsLogin={setIsLogin} isLoading={isLoading} setIsLoading={setIsLoading} error={error} setError={setError} language={language} handleAuth={handleAuth} L10n={L10n} />
        </div>
      </div>
    </Fragment>
  )
};

export async function getServerSideProps(context) {
  const { language } = context.query;
  const session = await getSession({ req: context.req });

  if (session) {
    return {
      redirect: {
        destination: `/profile?language=${language || "en"}`,
        permanent: false
      }
    }
  }

  return {
    props: { session }
  }
}

export default AuthPage;