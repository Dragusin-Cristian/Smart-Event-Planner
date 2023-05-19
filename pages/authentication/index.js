import { useContext } from 'react';
import { useRouter } from 'next/router';
import { getSession, signIn } from "next-auth/react";
import L10n from "../../L10n.json";
import { LanguageContext } from '../../context/language-context';
import AuthForm from '../../components/auth/AuthForm';
import axios from 'axios';

const AuthPage = () => {
  const router = useRouter();
  const language = useContext(LanguageContext).language;

  const handleAuth = async (email, pass, isLogin, username) => {
    if (!isLogin) {
      try {
        const response = await axios.post("/api/auth/signup", { email: email, password: pass, username: username });
        //TODO Handle success:
        console.log("Success, " + response.data.message);
      } catch (error) {
        //TODO handle errors:
        console.log(error.response.data.message);
      }
    } else {
      const result = await signIn("credentials", {
        redirect: false,
        email: email,
        password: pass
      });
      //TODO: handle success and errors:
      console.log(result);

      if (result.ok) {
        router.replace(`/?language=${language}`);
      }

    }
  }

  return (
    <div>
      <h1>{L10n[language].authenticate_word}:</h1>
      <div className="belowTitleContent">
        <AuthForm language={language} handleAuth={handleAuth} L10n={L10n} />
      </div>
    </div>
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