import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";
import { sendEventDeletedMail } from "../../../utils/mailUtils";
import dateFormat from "dateformat";

async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  const currentUserId = session.user.userId;

  const { eventId } = req.query;

  const client = await connectClient();
  const db = client.db();
  const eventsCollection = db.collection("events");
  const registrationsCollection = db.collection("registrations");
  const commentsCollection = db.collection("comments");
  const usersCollection = db.collection("users");

  // check if the user is authorized to delete this event (must it's own):
  const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });

  if (!existingEvent) {
    client.close();
    res.status(404).json({ message: "The event you are trying to delete doesn't appear to exist." });
    return;
  }

  if (existingEvent.authorId !== currentUserId) {
    client.close();
    res.status(401).json({ message: "You can only delete your own events!" });
  } else {
    // get the event's registrations so we can notify the registered users about the deletion:
    const registrations = await registrationsCollection.find({ eventId: eventId }).toArray();

    // delete the event, dependent comments and dependent registrations:
    const [resultDeleteEvent, resultDeleteReg, resultDeleteComm] =
      await Promise.all([
        eventsCollection.deleteOne({ _id: new ObjectId(eventId) }),
        registrationsCollection.deleteMany({ eventId: eventId }),
        commentsCollection.deleteMany({ eventId: eventId })
      ])

    // Send notification to all registered users:
    // handle all requests in parallel:
    const usersP = [];
    for (const reg of registrations) {
      usersP.push(usersCollection.findOne({ _id: new ObjectId(reg.signedUserId) }));
    }
    const users = await Promise.all(usersP);
    const dateString = dateFormat(existingEvent.date, "fullDate");

    // send all the users an email:
    for (const user of users) {
      sendEventDeletedMail(user.username, user.email, existingEvent.title, dateString, existingEvent.time, existingEvent.location);
    }

    client.close();
    res.status(200).json({ message: "You've successfully deleted this event!" });
  }
}

export default handler;
