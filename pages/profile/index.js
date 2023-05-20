import { useContext, useState, Fragment, useEffect } from 'react';
import Link from "next/link";
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getSession, signOut, useSession } from 'next-auth/react';
import axios from 'axios';
import L10n from "../../L10n.json";
import classes from "./profile.module.css";
import { LanguageContext } from '../../context/language-context';
import ProfileEventsList from '../../components/profile/ProfileEventsList';

const UserProfilePage = () => {
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const session = useSession();
  const [events, setEvents] = useState([]);
  const [accDelError, setAccDelError] = useState(null);
  const [accDelIsLoading, setAccDelIsLoading] = useState(false);
  const [eventsAreLoading, setEventsAreLoading] = useState(false);
  const [fetchEventsError, setFetchEventsError] = useState(false);

  const fetchUsersEvents = async () => {
    setEventsAreLoading(true);
    try {
      const response = await axios.get("/api/events/get-profile-events");
      setEvents(response.data.profileEvents)
      setFetchEventsError(null)
      setEventsAreLoading(false)
    } catch (e) {
      setFetchEventsError(e.response.data.message || e.response.statusText)
      setEventsAreLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersEvents();
  }, []);

  if (!session.data) {
    return <p>Loading...</p>
  }

  const { user } = session.data;

  const handleDeleteEvent = async (id, setEventLoading, setEventError) => {
    setEventLoading(true)
    try {
      await axios.delete(`/api/events/delete-event?eventId=${id}`);
      setEvents(oldState => oldState.filter(e => e.id !== id));
      setEventError(null)
      setEventLoading(false)
    } catch (e) {
      setEventError(e.response.data.message || e.response.statusText)
      setEventLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setAccDelIsLoading(true)
    try {
      await axios.delete("/api/auth/delete-account");
      signOut();
      router.replace(`/authentication?language=${language}`);
    } catch (e) {
      setAccDelIsLoading(false)
      setAccDelError(e.response.data.message || e.response.statusText)
    }
  }

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Profile Details</title>
        <meta
          name="description"
          content={"This page is dedicated to viewing a user's account details."}>
        </meta>
      </Head>

      <div>
        <h1>{L10n[language].Your_Profile}:</h1>
        <div className="belowTitleContent">
          <div className="halfOfFlex">
            <div className="insideHalfOfFLex">
              <p>{L10n[language].email_word}: {user.email}</p>
              <p>{L10n[language].username}: {user.username}</p>
              <Link className={classes.changePassBtn} href={`/profile/change-password?language=${language}`}><button>{L10n[language].Change_Password}</button></Link>
              {!accDelIsLoading ? <button className={classes.deleteAccountBtn} onClick={handleDeleteAccount}>{L10n[language].delete_account}</button> : <p>{L10n[language].loading}...</p>}
              {accDelError && <p className="error">{accDelError}</p>}
            </div>
          </div>
          <hr />
          <div className="halfOfFlex">
            <div className="insideHalfOfFLex">
              <h2>{L10n[language].your_events}:</h2>
              {eventsAreLoading && <p>{L10n[language].loading}...</p>}
              {fetchEventsError && <p className="error">{fetchEventsError}</p>}
              <ProfileEventsList events={events} handleDelete={handleDeleteEvent} L10n={L10n} language={language} />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
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
    props: {}
  }
}

export default UserProfilePage;
