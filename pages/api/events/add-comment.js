import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
import { sendEventCommentedMail } from "../../../utils/mailUtils";
import { ObjectId } from "mongodb";

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

  const { comment, eventId } = req.body;

  if(!comment || comment.trim().length === 0 || !eventId || eventId.trim().length === 0){
    res.status(403).json({message: "Cannot upload invalid comments."})
    return;
  }

  const client = await connectClient();
  const db = client.db();

  const commentsCollection = db.collection("comments");
  const eventsCollection = db.collection("events");
  const usersCollection = db.collection("users");

  const userId = session.user.userId;
  const userName = session.user.username;
  const result = await commentsCollection.insertOne({
    text: comment,
    eventId: eventId,
    userId: userId,
    userName: userName
  });


  // Send notification to the author:
  const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
  const author = await usersCollection.findOne({ _id: new ObjectId(event.authorId) });

  client.close();

  await sendEventCommentedMail(author.email, event.authorName, userName, event.title, eventId);

  res.status(201).json({
    message: "Comment added!",
    addedComment: {
      id: result.insertedId.toString(),
      text: comment,
      userName: userName,
      userId: userId
    }
  });
}

export default handler;
