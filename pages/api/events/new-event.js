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
