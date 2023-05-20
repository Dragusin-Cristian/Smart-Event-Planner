
import { useContext, Fragment, useState } from 'react';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import L10n from "../../L10n.json";
import axios from 'axios';
import { LanguageContext } from "../../context/language-context";
import ChangePasswordForm from '../../components/auth/ChangePasswordForm';

const ChangePasswordPage = () => {
  const { language } = useContext(LanguageContext);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  const handlePasswordChange = async (oldPass, newPass) => {
    setIsLoading(true);
    try {
      await axios.patch("/api/auth/change-password", {
        oldPassword: oldPass,
        newPassword: newPass
      })
      router.push(`/profile?language=${language}`);
    } catch (e) {
      setIsLoading(false)
      setError(e.response.data.message || e.response.statusText)
    }
  }

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Change your password</title>
        <meta
          name="description"
          content={"This page is dedicated to changing a user's password."}>
        </meta>
      </Head>

      <div>
        <h1>{L10n[language].change_your_password}:</h1>
        <div className="belowTitleContent">
          <ChangePasswordForm error={error} isLoading={isLoading} language={language} L10n={L10n} handlePasswordChange={handlePasswordChange} />
        </div>
      </div>
    </Fragment>
  )
};

export async function getServerSideProps(context) {
  const { language } = context.query;
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: {
        destination: `/authentication?language=${language || "en"}`,
        permanent: false
      }
    }
  }

  return {
    props: { session }
  }
}

export default ChangePasswordPage;
