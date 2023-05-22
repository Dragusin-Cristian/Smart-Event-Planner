import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import { connectClient } from "../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";
import { LanguageContext } from "../../context/language-context";
import L10n from "../../L10n.json";
import axios from "axios";
import CreateEventForm from "../../components/create or edit event/CreateEventForm";


const EditEventPage = ({ eventDetails }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const session = useSession();
  const title = useRef();
  const startDate = useRef();
  const endDate = useRef();
  const startTime = useRef();
  const endTime = useRef();
  const location = useRef();
  const description = useRef();
  const { language } = useContext(LanguageContext);
  const router = useRouter();

  const editEventHandler = async () => {
    setIsLoading(true);
    
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
      await axios.patch(`/api/events/edit-event?eventId=${eventDetails.id}`, newEvent);
      router.push(`/?language=${language}`);
    } catch (e) {
      setError(e.response.data.message || e.response.statusText)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    title.current.value = eventDetails.title
    startDate.current.value = eventDetails.startDate
    endDate.current.value = eventDetails.endDate
    startTime.current.value = eventDetails.startTime
    endTime.current.value = eventDetails.endTime
    location.current.value = eventDetails.location
    description.current.value = eventDetails.description
  }, [])

  return (
    <Fragment>
      <Head>
        <title>Smart Event Planner: Edit Event</title>
        <meta
          name="description"
          content="Make changes to your event.">
        </meta>
      </Head>
      <div>
        <h1>{L10n[language].edit_event}:</h1>
        <div className="belowTitleContent">
          <CreateEventForm
            handleEvent={editEventHandler}
            L10n={L10n}
            language={language}
            titleRef={title}
            startDateRef={startDate}
            endDateRef={endDate}
            startTimeRef={startTime}
            endTimeRef={endTime}
            locationRef={location}
            descriptionRef={description}
            isAdd={false}
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

  const eventId = context.params.eventId;
  // fetch the data from db
  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  const registrationsCollection = db.collection("registrations");

  const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) })

  const registrations = await registrationsCollection.find({ eventId: eventId }).project({ eventId: 0 }).toArray();
  client.close();

  return {
    props: {
      session,
      eventDetails: {
        id: event._id.toString(),
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        description: event.description,
        authorName: event.authorName,
        authorId: event.authorId,
        registrations: registrations ? registrations.map(reg => ({
          signedUserName: reg.signedUserName,
          signedUserId: reg.signedUserId,
          date: reg.date.toString(),
          _id: reg._id.toString()
        })) : []
      }
    }
  }
}

export default EditEventPage;