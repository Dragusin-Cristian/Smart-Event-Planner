import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";
import { sendEventUpdatedMail } from "../../../utils/mailUtils";
import dateFormat from "dateformat";

async function handler(req, res) {
  if (req.method !== "PATCH") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  const currentUserId = session.user.userId;

  const { eventId } = req.query;
  const { title, date, time, location, description, authorId, authorName } = req.body;

  const client = await connectClient();
  const db = client.db();
  const eventsCollection = db.collection("events");
  const registrationsCollection = db.collection("registrations");
  const usersCollection = db.collection("users");

  // check if the user is authorized to delete this event (must it's own):
  const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });

  if (!existingEvent) {
    res.status(404).json({ message: "The event you are trying to edit doesn't appear to exist." });
    client.close();
    return;
  }

  if (existingEvent.authorId !== currentUserId) {
    res.status(401).json({ message: "You can only edit your own events!" });
  } else {
    const result = await eventsCollection.updateOne({ _id: new ObjectId(eventId) },
      {
        $set: {
          title: title,
          date: date,
          time: time,
          location: location,
          description: description,
          authorId: authorId,
          authorName: authorName
        }
      });
    //TODO: handle success and error

    console.log("resultDeleteEvent", result);

    res.status(200).json({ message: "You've successfully deleted this event!" });

    const registrations = await registrationsCollection.find({ eventId: eventId }).toArray();
    console.log(registrations);

    // handle all requests in parallel:
    const usersP = [];
    for (const reg of registrations) {
      usersP.push(usersCollection.findOne({ _id: new ObjectId(reg.signedUserId) }));
    }
    const users = await Promise.all(usersP);

    const dateString = dateFormat(existingEvent.date, "fullDate");
    for (const user of users) {
      sendEventUpdatedMail(user.email, user.username, existingEvent.title, eventId, title, dateString, time, location, description);
    }

  }

  client.close();

}

export default handler;
