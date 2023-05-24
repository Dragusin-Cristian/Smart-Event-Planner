import { ObjectId } from "mongodb";
import { connectClient } from "../../../utils/MongoDbUtils";

async function handler(req, res) {

  if (req.method !== "GET") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const { eventId } = req.query;

  if (!eventId || eventId.trim().length === 0) {
    res.status(403).json({ message: "Event Id must be valid!" });
    return;
  }

  const client = await connectClient();
  const db = client.db();
  const registrationsCollection = db.collection("registrations");
  const commentsCollection = db.collection("comments");
  const eventsCollection = db.collection("events");

  const [registrations, comments, eventTitle] = await Promise.all([
    registrationsCollection.find({ eventId: eventId }).project({ eventId: 0 }).toArray(),
    commentsCollection.find({ eventId: eventId }).project({ usersString: 0, eventId: 0 }).toArray(),
    eventsCollection.findOne({ _id: new ObjectId(eventId) }, {projection: {title: 1, _id: 0}})
  ]);

  client.close();
  res.status(200).json({
    registrations: registrations ? registrations.map(reg => ({
      signedUserName: reg.signedUserName,
      signedUserId: reg.signedUserId,
      date: reg.date.toString(),
      _id: reg._id.toString()
    })) : [],
    comments: comments ? comments.map(comm => ({
      id: comm._id.toString(),
      text: comm.text,
      userName: comm.userName,
      userId: comm.userId
    })) : [],
    eventTitle: eventTitle.title
  })
}

export default handler;
