import { useContext, useRef, Fragment } from "react";
import { useSession, getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import L10n from "../../L10n.json";
import axios from "axios";
import { LanguageContext } from "../../context/language-context";
import CreateEventForm from "../../components/create or edit event/CreateEventForm";


const CreateEventPage = () => {
  const session = useSession();
  const title = useRef();
  const date = useRef();
  const time = useRef();
  const location = useRef();
  const description = useRef();
  const { language } = useContext(LanguageContext);
  const router = useRouter();

  const addEventHandler = async () => {
    const newEvent = {
      title: title.current.value,
      date: date.current.value,
      time: time.current.value,
      location: location.current.value,
      description: description.current.value,
      authorId: session.data.user.userId,
      authorName: session.data.user.username
    }
    await axios.post("/api/events/new-event", newEvent);
    router.push(`/?language=${language}`);
  }

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Plan a new event</title>
        <meta
          name="description"
          content={"This page is dedicated to plaanning new events."}>
        </meta>
      </Head>

      <div>
        <h1>{L10n[language].add_event}:</h1>

        <div className="belowTitleContent">
          <CreateEventForm
            handleEvent={addEventHandler}
            L10n={L10n}
            language={language}
            titleRef={title}
            dateRef={date}
            timeRef={time}
            locationRef={location}
            descriptionRef={description}
            isAdd={true}
          />
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
    props: { session }
  }

}

export default CreateEventPage;
