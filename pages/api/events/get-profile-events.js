import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";

async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  // Protects the API route against unauthenticated users:
  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }


  const client = await connectClient();
  const db = client.db();
  const eventsCollection = db.collection("events");
  const events = await eventsCollection.find({ authorId: session.user?.userId }).toArray();

  client.close();
  res.status(200).json({
    profileEvents: events.length ? events.map(e => ({
      id: e._id.toString(),
      title: e.title,
      date: e.date,
      time: e.time,
      location: e.location,
      description: e.description,
      authorId: e.authorId,
      authorName: e.authorName
    })) : []
  })
}

export default handler;
