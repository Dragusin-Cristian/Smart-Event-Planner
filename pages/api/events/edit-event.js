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
  const { title, eventStartDate, eventEndDate, eventStartTime, eventEndTime, location, description, authorId, authorName } = req.body;

  if (!title || title.trim().length === 0 ||
    !eventStartDate || eventStartDate.trim().length === 0 ||
    !eventEndDate || eventEndDate.trim().length === 0 ||
    !eventStartTime || eventStartTime.trim().length === 0 ||
    !eventEndTime || eventEndTime.trim().length === 0 ||
    !location || location.trim().length === 0 ||
    !description || description.trim().length === 0 ||
    !authorId || authorId.trim().length === 0 ||
    !authorName || authorName.trim().length === 0) {
    res.status(403).json({ message: "Cannot upload empty data." })
    return;
  }

  const currentDate = new Date();
  const newDateStart = new Date(eventStartDate + "T" + eventStartTime + ":00");
  const newDateEnd = new Date(eventEndDate + "T" + eventEndTime + ":00");
  currentDate.setDate(currentDate.getDate() + 1)

  if (currentDate > newDateStart) {
    res.status(403).json({ message: "Events must be planned with at least 24 hours before." })
    return;
  }

  if (newDateStart > newDateEnd) {
    res.status(403).json({ message: "The end date must be after the start date." })
    return;
  }

  const client = await connectClient();
  const db = client.db();
  const eventsCollection = db.collection("events");
  const registrationsCollection = db.collection("registrations");
  const usersCollection = db.collection("users");

  const existingEvent = await eventsCollection.findOne({ _id: new ObjectId(eventId) });

  if (!existingEvent) {
    client.close();
    res.status(404).json({ message: "The event you are trying to edit doesn't appear to exist." });
    return;
  }

  // check if the user is authorized to delete this event (must it's own):
  if (existingEvent.authorId !== currentUserId) {
    client.close();
    res.status(401).json({ message: "You can only edit your own events!" });
  } else {
    await eventsCollection.updateOne({ _id: new ObjectId(eventId) },
      {
        $set: {
          title: title,
          startDate: eventStartDate,
          endDate: eventEndDate,
          startTime: eventStartTime,
          endTime: eventEndTime,
          location: location,
          description: description,
          authorId: authorId,
          authorName: authorName
        }
      });


    // send notification mail to all registered users:
    const registrations = await registrationsCollection.find({ eventId: eventId }).toArray();

    // handle all requests in parallel:
    const usersP = [];
    for (const reg of registrations) {
      usersP.push(usersCollection.findOne({ _id: new ObjectId(reg.signedUserId) }));
    }
    const users = await Promise.all(usersP);

    client.close();

    const dateString = dateFormat(existingEvent.date, "fullDate");
    // send all mails in parallel:
    const mailPromises = [];
    for (const user of users) {
      mailPromises.push(sendEventUpdatedMail(user.email, user.username, existingEvent.title, eventId, title, dateString, eventStartTime, location, description));
    }
    await Promise.all(mailPromises)

    res.status(200).json({ message: "You've successfully edited this event!" });
  }
}

export default handler;
