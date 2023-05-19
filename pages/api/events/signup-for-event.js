import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
import { ics } from "calendar-link";
import { sendEventSignUpMail } from "../../../utils/mailUtils";
import dateFormat from "dateformat";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  const currentUserId = session.user.userId;
  const currentUserName = session.user.username;
  const currentUserEmail = session.user.email;

  const { eventId, eventName, date, time, location, description, authorId } = req.body;

  // check if user is the author:
  if (authorId === currentUserId) {
    res.status(403).json({ message: "Authors cannot signup for their own events!" });
    return;
  }

  const client = await connectClient();
  const db = client.db();
  const registrationsCollection = db.collection("registrations");

  // check if the user is already signed up for this event:
  const existingSignup = await registrationsCollection.findOne({
    eventId: eventId,
    signedUserId: currentUserId
  });
  if (existingSignup) {
    res.status(409).json({ message: "You are already singed up for this event!" });
    client.close();
    return;
  }


  // signup the user for the event:
  const newRegistration = {
    eventId,
    signedUserId: currentUserId,
    signedUserName: currentUserName,
    date: new Date()
  }
  const result = await registrationsCollection.insertOne(newRegistration);
  newRegistration._id = result.insertedId.toString();

  //TODO: handle success and error
  console.log(result);
  client.close();

  res.status(201).json({ message: "Event signup succeeded!", newRegistration: newRegistration });

  

  const icsContent = `BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:Event Planner
  BEGIN:VEVENT
  DTSTART:${dateFormat(date + " " + time, "isoDateTime")}
  SUMMARY:${eventName}
  DESCRIPTION:${description}
  LOCATION:${location}
  END:VEVENT
  END:VCALENDAR`;
  const icsBase64 = btoa(unescape(encodeURIComponent(icsContent)));

  const dateString = dateFormat(date, "fullDate");
  sendEventSignUpMail(currentUserEmail, currentUserName, eventName, dateString, time, location, icsBase64);

}

export default handler;
