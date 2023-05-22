import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
// import { ics } from "calendar-link";
import { sendEventSignUpMail } from "../../../utils/mailUtils";
import dateFormat from "dateformat";
const ICAL = require('ical.js');

async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  const currentUserId = session.user.userId;
  const currentUserName = session.user.username;
  const currentUserEmail = session.user.email;

  const { eventId, eventName, eventStartDate, eventEndDate, eventStartTime, eventEndTime, location, description, authorId, } = req.body;

  if (!eventId || eventId.trim().length === 0 ||
    !eventStartDate || eventStartDate.trim().length === 0 ||
    !eventEndDate || eventEndDate.trim().length === 0 ||
    !eventStartTime || eventStartTime.trim().length === 0 ||
    !eventEndTime || eventEndTime.trim().length === 0 ||
    !location || location.trim().length === 0 ||
    !description || description.trim().length === 0 ||
    !authorId || authorId.trim().length === 0) {
    res.status(403).json({ message: "Cannot upload empty data." })
    return;
  }

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
    client.close();
    res.status(409).json({ message: "You are already singed up for this event!" });
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

  client.close();


  // Create a new Calendar object
  const calendar = new ICAL.Component(['vcalendar', [], []]);
  // Create a new Event object
  const event = new ICAL.Component('vevent');
  // Set event properties
  event.addPropertyWithValue('uid', '1234567890');
  event.addPropertyWithValue('summary', eventName);
  event.addPropertyWithValue('description', description);
  event.addPropertyWithValue('location', location);
  const startDate = ICAL.Time.fromDateTimeString(eventStartDate + "T" + eventStartTime + ":00Z");
  event.addPropertyWithValue('dtstart', startDate);
  const endDate = ICAL.Time.fromDateTimeString(eventEndDate + "T" + eventEndTime + ":00Z");
  event.addPropertyWithValue('dtend', endDate);
  // Add the event to the calendar
  calendar.addSubcomponent(event);
  // Generate the .ics file content
  const icsContent = calendar.toString();

  const dateString = dateFormat(eventStartDate, "fullDate");
  sendEventSignUpMail(currentUserEmail, currentUserName, eventName, dateString, eventStartTime, location, icsContent);

  res.status(201).json({ message: "Event signup succeeded!", newRegistration: newRegistration });
}

export default handler;
