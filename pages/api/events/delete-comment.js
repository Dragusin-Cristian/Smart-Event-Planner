import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";

async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  const currentUserId = session?.user.userId;

  const { commentId } = req.query;

  const client = await connectClient();
  const db = client.db();
  const commentsCollection = db.collection("comments");

  // check if the user is authorized to delete this comment (must it's own):
  const existingComment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });

  if (!existingComment) {
    res.status(404).json({ message: "The comment you are trying to delete doesn't appear to exist." });
    client.close();
    return;
  }

  if (existingComment.userId !== currentUserId) {
    res.status(401).json({ message: "You can only delete your own comments!" });
  } else {
    const resultDeleteComment = await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });
    //TODO: handle success and error

    console.log("resultDeleteComment", resultDeleteComment);

    res.status(200).json({ message: "You've successfully deleted this comment!" });
  }

  client.close();

}

export default handler;
