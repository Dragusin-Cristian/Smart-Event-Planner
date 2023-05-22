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
  const commentsCollection = db.collection("comments");
  const comments = await commentsCollection.find({ eventId: eventId }).project({ usersString: 0, eventId: 0 }).toArray();

  client.close();
  res.status(200).json({
    comments: comments ? comments.map(comm => ({
      id: comm._id.toString(),
      text: comm.text,
      userName: comm.userName,
      userId: comm.userId
    })) : []
  })
}

export default handler;
