import { useContext, useRef, Fragment, useState } from "react";
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
  const startDate = useRef();
  const endDate = useRef();
  const startTime = useRef();
  const endTime = useRef();
  const location = useRef();
  const description = useRef();
  const { language } = useContext(LanguageContext);
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)
  const router = useRouter();

  const addEventHandler = async () => {
    setIsLoading(true)
    const newEvent = {
      title: title.current.value,
      eventStartDate: startDate.current.value,
      eventEndDate: endDate.current.value,
      eventStartTime: startTime.current.value,
      eventEndTime: endTime.current.value,
      location: location.current.value,
      description: description.current.value,
      authorId: session.data.user.userId,
      authorName: session.data.user.username
    }

    try {
      await axios.post("/api/events/new-event", newEvent);
      router.push(`/?language=${language}`);
    } catch (e) {
      setIsLoading(false)
      setError(e.response.data.message || e.response.statusText)
    }
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
            startDateRef={startDate}
            endDateRef={endDate}
            startTimeRef={startTime}
            endTimeRef={endTime}
            locationRef={location}
            descriptionRef={description}
            isAdd={true}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            error={error}
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
