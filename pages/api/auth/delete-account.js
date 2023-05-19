import { getServerSession } from "next-auth";
import { authOptions } from "./[...nextauth]";
import { connectClient } from "../../../utils/MongoDbUtils";
import { ObjectId } from "mongodb";

async function handler(req, res) {
  if (req.method !== "DELETE") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  // Check if user is logged in:
  if (!session?.user) {
    res.status(403).json({ message: "You must be authenticated in order to delete your account!" });
    return;
  }

  const currentUserId = session.user.userId;

  const client = await connectClient();
  const db = client.db();
  const usersCollection = db.collection("users");
  const eventsCollection = db.collection("events");
  const commentsCollection = db.collection("comments");
  const registrationsCollection = db.collection("registrations");

  const existingAccount = await usersCollection.findOne({ _id: new ObjectId(currentUserId) });

  // check if the account exists:
  if (!existingAccount) {
    res.status(404).json({ message: "The user you are trying to delete doesn't appear to exist." });
    client.close();
    return;
  }

  // check if the user is authorized to delete this account (must it's own):
  if (existingAccount._id.toString() !== currentUserId) {
    res.status(401).json({ message: "You can only delete your own account!" });
  } else {
    // delete the user's events, comments and registrations:
    const [resultDeleteEvents, resultDeleteComments, resultDeleteRegistrations] =
      await Promise.all([
        eventsCollection.deleteMany({ authorId: currentUserId }),
        commentsCollection.deleteMany({ userId: currentUserId }),
        registrationsCollection.deleteMany({ signedUserId: currentUserId })
      ]);

    // delete the user:
    //TODO: handle success and error
    const resultDeleteUser = await usersCollection.deleteOne({ _id: new ObjectId(currentUserId) });
    console.log("resultDeleteUser", resultDeleteUser);
    console.log("resultDeleteEvents", resultDeleteEvents);
    console.log("resultDeleteComments", resultDeleteComments);
    console.log("resultDeleteRegistrations", resultDeleteRegistrations);

    res.status(200).json({ message: "You've successfully deleted your account!" });
  }

  client.close();

}

export default handler;
