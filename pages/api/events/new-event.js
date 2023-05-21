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

  const { title, date, time, location, description, authorId, authorName } = req.body;

  if (!title || title.trim().length === 0 ||
    !date || date.trim().length === 0 ||
    !time || time.trim().length === 0 ||
    !location || location.trim().length === 0 ||
    !description || description.trim().length === 0 ||
    !authorId || authorId.trim().length === 0 ||
    !authorName || authorName.trim().length === 0) {
    res.status(403).json({ message: "Cannot upload empty data." })
    return;
  }

  const currentDate = new Date();
  const newDate = new Date(date + "T" + time + ":00");
  currentDate.setDate(currentDate.getDate() + 1)

  if(currentDate > newDate){
    res.status(403).json({message: "Events must be planned with at least 24 hours before."})
    return;
  }

  const client = await connectClient();
  const db = client.db();

  const eventsCollection = db.collection("events");
  const result = await eventsCollection.insertOne({ title, date, time, location, description, authorId, authorName });
  //TODO: handle success and error
  console.log(result);
  client.close();

  res.status(201).json({ message: "Event added!" });

}

export default handler;
