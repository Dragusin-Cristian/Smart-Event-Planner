import { useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import L10n from "../../L10n.json";
import { LanguageContext } from "../../context/language-context";
import { connectClient } from "../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";
import { checkIfSessionAuthenticated } from "../../utils/AuthUtils";
import axios from "axios";
import CommentsForm from "../../components/event details/CommentsForm";
import Comment from "../../components/event details/Comment";

const EventDetailsPage = ({ eventDetails, comments: commentsProps }) => {

  const session = useSession();
  const { language } = useContext(LanguageContext);
  const [eventRegistrationId, setEventRegistrationId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [registeredUsersString, setRegisteredUsersString] = useState(L10n[language].No_users_signedup);
  const { id: eventId, title, date, description, location, time, authorName, authorId, registrations: propsRegistrations } = eventDetails;
  const [registrations, setRegistrations] = useState(propsRegistrations)
  const [comments, setComments] = useState(commentsProps);
  const isAuthor = session.data?.user.userId === authorId;

  const signupUpForEvent = async () => {
    try {
      const response = await axios.post("/api/events/signup-for-event", {
        eventId: eventId,
        eventName: title,
        date: date,
        time: time,
        location: location,
        description: description,
        authorId: authorId
      })
      const { newRegistration } = response.data
      setEventRegistrationId(newRegistration._id);
      setRegistrations(oldState => oldState.concat(newRegistration))
      //TODO: handle success
      console.log(response);
    } catch (e) {
      //TODO: handle error
      console.log(e);
    }
  }

  const resignFromEvent = async () => {
    try {
      const response = await axios.delete(`/api/events/resign-from-event?registrationId=${eventRegistrationId}`)
      console.log(response);
      //TODO: handle success
      setEventRegistrationId(null);
      setRegistrations(oldState => oldState.filter(r => r._id != eventRegistrationId));
    } catch (e) {
      //TODO: handle error
      console.log(e);
    }
  }

  const addComment = async (comment) => {
    try {
      const response = await axios.post("/api/events/add-comment", { comment, eventId })
      console.log(response);
      //TODO: handle success
      if (response.status === 201) {
        setComments(oldState => oldState.concat(response.data.addedComment))
      }
    } catch (e) {
      //TODO: handle error
      console.log(e);
    }
  }

  const deleteComment = async (commentId) => {
    try {
      const response = await axios.delete(`/api/events/delete-comment?commentId=${commentId}`);
      //TODO: handle success
      if (response.status === 200) {
        setComments(oldState => oldState.filter(comm => comm.id != commentId))
      }
    } catch (e) {
      //TODO: handle error
      console.log(e);
    }
  }

  useEffect(() => {
    setAuthenticated(checkIfSessionAuthenticated(session));

    let usersString;
    if (!registrations || registrations.length === 0) {
      usersString = L10n[language].No_users_signedup;
    } else {
      usersString = L10n[language].Signed_up_users + ": ";
      registrations?.map((reg, i) => {
        if (reg.signedUserId === session.data?.user.userId) {
          usersString += L10n[language].you_word;
          setEventRegistrationId(reg._id);
        } else {
          usersString += reg.signedUserName;
        }

        if (i !== registrations.length - 1) {
          usersString += ", ";
        }
      })
    }

    (usersString !== registeredUsersString) && setRegisteredUsersString(usersString)
  }, [session, registrations])


  return (

    <div>
      <h1>{L10n[language].details_word}:</h1>
      <div className="belowTitleContent">
        <div className="halfOfFlex">
          <div className="insideHalfOfFLex">
            <ul>
              <li>{L10n[language].title_word}: {eventDetails.title}</li>
              <li>{L10n[language].author}: {isAuthor ? L10n[language].you_word : authorName}</li>
              <li>{L10n[language].date_word}: {date}</li>
              <li>{L10n[language].time_word}: {time}</li>
              <li>{L10n[language].location_word}: {location}</li>
              <li>{registeredUsersString}.</li>
              <li>{L10n[language].description_word}:</li>
            </ul>
            <p>{description}</p>

            {!isAuthor && authenticated && !eventRegistrationId && <button onClick={signupUpForEvent}>{L10n[language].Signup_for_event}</button>}
            {!isAuthor && authenticated && eventRegistrationId && <button onClick={resignFromEvent}>{L10n[language].resign_from_event}</button>}
          </div>
        </div>
        <hr />
        <div className="halfOfFlex">
          <div className="insideHalfOfFLex">
            <div className="listScrollOverflow">
              <h2>{L10n[language].comments_section}:</h2>
              {comments.length === 0 ?
                <p>{L10n[language].no_comments}</p>
                : comments.map((comm, i) => {
                  const isCommAuthor = comm.userId === session.data?.user.userId ? true : false
                  const usernameText = isCommAuthor ? L10n[language].you_word : comm.userName
                  return <Comment
                    key={i}
                    isCommAuthor={isCommAuthor}
                    username={usernameText}
                    text={comm.text}
                    L10n={L10n}
                    language={language}
                    deleteComment={deleteComment}
                    id={comm.id}
                    authenticated={authenticated}
                  />
                })
              }
              <h3>{L10n[language].add_comment}:</h3>
              <CommentsForm L10n={L10n} language={language} addComment={addComment} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export async function getStaticPaths() {
  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  const events = await eventsCollection.find({}, { _id: 1 }).toArray();

  client.close();

  return {
    fallback: false,
    paths: events.map(event => ({ params: { eventId: event._id.toString() } }))
  }
}

export async function getStaticProps(context) {
  const eventId = context.params.eventId;
  // fetch the data from db
  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  const registrationsCollection = db.collection("registrations");
  const commentsCollection = db.collection("comments");

  const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) })

  const registrations = await registrationsCollection.find({ eventId: eventId }).project({ eventId: 0 }).toArray();
  const comments = await commentsCollection.find({ eventId: eventId }).project({ usersString: 0, eventId: 0 }).toArray();
  client.close();

  return {
    props: {
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
      },
      comments: comments ? comments.map(comm => ({
        id: comm._id.toString(),
        text: comm.text,
        userName: comm.userName,
        userId: comm.userId
      })) : []
    }
  }
}

export default EventDetailsPage;