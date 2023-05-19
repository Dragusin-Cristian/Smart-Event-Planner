
import { useContext } from 'react';
import { getSession } from 'next-auth/react';
import L10n from "../../L10n.json";
import axios from 'axios';
import { LanguageContext } from "../../context/language-context";
import ChangePasswordForm from '../../components/auth/ChangePasswordForm';

const ChangePasswordPage = () => {
  const { language } = useContext(LanguageContext);

  const handlePasswordChange = async (oldPass, newPass) => {
    try {
      const response = await axios.patch("/api/auth/change-password", {
        oldPassword: oldPass,
        newPassword: newPass
      })
      //TODO: handle success
      console.log(response);
    } catch (e) {
      //TODO: handle error
      console.log(e);
    }
  }

  return (
    <div>
      <h1>{L10n[language].change_your_password}:</h1>
      <div className="belowTitleContent">
        <ChangePasswordForm language={language} L10n={L10n} handlePasswordChange={handlePasswordChange} />
      </div>
    </div>

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
