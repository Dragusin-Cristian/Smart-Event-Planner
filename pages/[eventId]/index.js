import { Fragment, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Head from "next/head";
import L10n from "../../L10n.json";
import { LanguageContext } from "../../context/language-context";
import { connectClient } from "../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";
import { checkIfSessionAuthenticated } from "../../utils/AuthUtils";
import axios from "axios";
import CommentsForm from "../../components/event details/CommentsForm";
import Comment from "../../components/event details/Comment";

const EventDetailsPage = ({ eventDetails }) => {

  const session = useSession();
  const { language } = useContext(LanguageContext);
  const [eventRegistrationId, setEventRegistrationId] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [registeredUsersString, setRegisteredUsersString] = useState(L10n[language].No_users_signedup);
  const [isLoadingEventRegistration, setIsLoadingEventRegistration] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [errorEventRegistration, setErrorEventRegistration] = useState(null);
  const [errorComment, setErrorComment] = useState(null);
  const { id: eventId, title, startDate, endDate, description, location, startTime, endTime, authorName, authorId } = eventDetails;
  const [registrations, setRegistrations] = useState([]);
  const [comments, setComments] = useState([]);
  const [latestEventTitle, setLatestEventTitle] = useState(title);
  const isAuthor = session.data?.user.userId === authorId;

  const signupUpForEvent = async () => {
    setIsLoadingEventRegistration(true)
    try {
      const response = await axios.post("/api/events/signup-for-event", {
        eventId: eventId,
        eventName: latestEventTitle,
        eventStartDate: startDate,
        eventEndDate: endDate,
        eventStartTime: startTime,
        eventEndTime: endTime,
        location: location,
        description: description,
        authorId: authorId
      })
      const { newRegistration } = response.data
      setEventRegistrationId(newRegistration._id);
      setRegistrations(oldState => oldState.concat(newRegistration))
      setIsLoadingEventRegistration(false)
      setErrorEventRegistration(null)
    } catch (e) {
      setErrorEventRegistration(e.response.data.message || e.response.statusText)
      setIsLoadingEventRegistration(false)
    }
  }

  const resignFromEvent = async () => {
    setIsLoadingEventRegistration(true)
    try {
      await axios.delete(`/api/events/resign-from-event?registrationId=${eventRegistrationId}`)
      setEventRegistrationId(null);
      setRegistrations(oldState => oldState.filter(r => r._id != eventRegistrationId));
      setIsLoadingEventRegistration(false)
      setErrorEventRegistration(null)
    } catch (e) {
      setErrorEventRegistration(e.response.data.message || e.response.statusText)
      setIsLoadingEventRegistration(false)
    }
  }

  const addComment = async (comment) => {
    setIsLoadingComment(true)
    try {
      const response = await axios.post("/api/events/add-comment", { comment, eventId })
      setComments(oldState => oldState.concat(response.data.addedComment))
      setIsLoadingComment(false)
      setErrorComment(null)
    } catch (e) {
      setIsLoadingComment(false)
      setErrorComment(e.response.data.message || e.response.statusText)
    }
  }

  const deleteComment = async (commentId, setIsLoadingCommentDelete, setErrorCommentDelete) => {
    setIsLoadingCommentDelete(true);
    try {
      await axios.delete(`/api/events/delete-comment?commentId=${commentId}`);
      setComments(oldState => oldState.filter(comm => comm.id != commentId))
      setIsLoadingCommentDelete(false)
      setErrorCommentDelete(null)
    } catch (e) {
      setErrorCommentDelete(e.response.data.message || e.response.statusText)
      setIsLoadingCommentDelete(false)
    }
  }


  useEffect(() => {
    const execute = async () => {
      const details = await axios.get(`/api/events/get-event-details?eventId=${eventId}`)
      const { comments, registrations, eventTitle } = details.data;
      setLatestEventTitle(eventTitle);
      setRegistrations(registrations);
      setComments(comments);
    }

    execute();
  }, [])

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
    <Fragment>
      <Head>
        <title>{latestEventTitle} Event</title>
        <meta
          name="description"
          content={`All details about the ${latestEventTitle} event: ${description}`}>
        </meta>
      </Head>

      <div>
        <h1>{L10n[language].details_word}:</h1>
        <div className="belowTitleContent">
          <div className="halfOfFlex">
            <div className="insideHalfOfFLex">
              <ul>
                <li>{L10n[language].title_word}: {latestEventTitle}</li>
                <li>{L10n[language].author}: {isAuthor ? L10n[language].you_word : authorName}</li>
                <li>{L10n[language].start_date}: {startDate}</li>
                <li>{L10n[language].start_time}: {startTime}</li>
                <li>{L10n[language].end_date}: {endDate}</li>
                <li>{L10n[language].end_time}: {endTime}</li>
                <li>{L10n[language].location_word}: {location}</li>
                <li>{registeredUsersString}.</li>
                <li>{L10n[language].description_word}:</li>
              </ul>
              <p>{description}</p>

              {!isAuthor && authenticated && !eventRegistrationId && (!isLoadingEventRegistration ? <button onClick={signupUpForEvent}>{L10n[language].Signup_for_event}</button> : <p>{L10n[language].loading}...</p>)}
              {!isAuthor && authenticated && eventRegistrationId && (!isLoadingEventRegistration ? <button onClick={resignFromEvent}>{L10n[language].resign_from_event}</button> : <p>{L10n[language].loading}...</p>)}
              {errorEventRegistration && <p className="error">{errorEventRegistration}</p>}
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
                      id={comm.id}
                      authenticated={authenticated}
                      setComments={setComments}
                      deleteComment={deleteComment}
                    />
                  })
                }
                <h3>{L10n[language].add_comment}:</h3>
                <CommentsForm isLoadingComment={isLoadingComment} L10n={L10n} language={language} addComment={addComment} errorComment={errorComment} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export async function getStaticPaths() {
  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  const events = await eventsCollection.find({}, { _id: 1 }).toArray();

  client.close();

  return {
    fallback: "blocking", // in this case is better then true (or false), because it waits until the page is fully returned (SEO & UX purposes)
    paths: events.map(event => ({ params: { eventId: event._id.toString() } }))
  }
}

export async function getStaticProps(context) {
  const eventId = context.params.eventId;
  // fetch the data from db
  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  try {
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) })
    client.close();
    return {
      revalidate: 30, // regenerate every 30 hours (maybe the author has edited the event) 
      props: {
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
        }
      }
    }
  } catch (error) {
    return {
      notFound: true
    }
  }

}

export default EventDetailsPage;