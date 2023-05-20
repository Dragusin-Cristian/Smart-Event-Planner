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
  const registrationsCollection = db.collection("registrations");

  const registrations = await registrationsCollection.find({ eventId: eventId }).project({ eventId: 0 }).toArray();

  res.status(200).json({
    registrations: registrations ? registrations.map(reg => ({
      signedUserName: reg.signedUserName,
      signedUserId: reg.signedUserId,
      date: reg.date.toString(),
      _id: reg._id.toString()
    })) : []
  })

  client.close();

}

export default handler;
