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
  const currentUserId = session.user.userId;

  const { registrationId } = req.query;

  const client = await connectClient();
  const db = client.db();
  const registrationsCollection = db.collection("registrations");

  // check if the user is authorized to delete this regostration (must it's own):
  const existingSignup = await registrationsCollection.findOne({ _id: new ObjectId(registrationId) });

  if (!existingSignup) {
    res.status(404).json({ message: "You don't appear to be signed up for this event." });
    client.close();
    return;
  }

  if (existingSignup.signedUserId !== currentUserId) {
    res.status(401).json({ message: "You can only delete your signups for events!" });
  } else {
    await registrationsCollection.deleteOne({ _id: new ObjectId(registrationId) });
    res.status(200).json({ message: "You've been successfully resigned from this event!" });
  }

  client.close();

}

export default handler;
