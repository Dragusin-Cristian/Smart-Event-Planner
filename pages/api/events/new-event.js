import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";

async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  // Protects the API route against unauthenticated users:
  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

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

  if(newDateStart > newDateEnd){
    res.status(403).json({ message: "The end date must be after the start date." })
    return;
  }

  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  const result = await eventsCollection.insertOne(
    {
      title,
      startDate: eventStartDate,
      endDate: eventEndDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      location,
      description,
      authorId,
      authorName
    }
  );

  //TODO: handle success and error
  console.log(result);
  client.close();

  res.status(201).json({ message: "Event added!" });

}

export default handler;
