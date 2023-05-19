import { useContext, useEffect, useRef } from "react";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { connectClient } from "../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";
import { LanguageContext } from "../../context/language-context";
import L10n from "../../L10n.json";
import CreateEventForm from "../../components/create or edit event/CreateEventForm";
import axios from "axios";


const EditEventPage = ({ eventDetails }) => {
  const session = useSession();
  const title = useRef();
  const date = useRef();
  const time = useRef();
  const location = useRef();
  const description = useRef();
  const { language } = useContext(LanguageContext);
  const router = useRouter();

  const editEventHandler = async () => {
    const newEvent = {
      title: title.current.value,
      date: date.current.value,
      time: time.current.value,
      location: location.current.value,
      description: description.current.value,
      authorId: session.data.user.userId,
      authorName: session.data.user.username
    }

    try {
      const response = await axios.patch(`/api/events/edit-event?eventId=${eventDetails.id}`, newEvent);
      console.log(response);
    } catch (e) {
      //TODO: handle error
      console.log(e);
    }

    router.push(`/?language=${language}`);
  }

  useEffect(() => {
    title.current.value = eventDetails.title
    date.current.value = eventDetails.date
    time.current.value = eventDetails.time
    location.current.value = eventDetails.location
    description.current.value = eventDetails.description
  }, [])

  return (
    <div>
      <h1>{L10n[language].edit_event}:</h1>
      <div className="belowTitleContent">
        <CreateEventForm
          handleEvent={editEventHandler}
          L10n={L10n}
          language={language}
          titleRef={title}
          dateRef={date}
          timeRef={time}
          locationRef={location}
          descriptionRef={description}
          isAdd={false}
        />
      </div>
    </div>
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
        date: event.date,
        time: event.time,
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