import { getServerSession } from "next-auth/next"
import { authOptions } from './[...nextauth]'
import { connectClient } from "../../../utils/MongoDbUtils";
import { hashPassword, verifyPassword } from "../../../utils/AuthUtils";

async function handler(req, res) {

  if (req.method !== "PATCH") {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const session = await getServerSession(req, res, authOptions);

  // Protects the API route from unauthenticated users:
  // GREAT FOR CHECKING RIGHTS
  if (!session) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  const userEmail = session.user.email;
  const { oldPassword, newPassword } = req.body;

  const client = await connectClient();
  const db = client.db();

  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne({ email: userEmail });

  if (!user) {
    res.status(404).json({ message: "User not found" });
    client.close();
    return;
  }

  const currentPassword = user.password;

  const passwordAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordAreEqual) {
    res.status(403).json({ message: "Invalid password" }); // 403: you are authenticated but not authorized
    client.close();
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  const result = await usersCollection.updateOne({ email: userEmail }, { $set: { password: hashedPassword } });

  //TODO more error handling ...

  client.close();
  res.status(200).json({ message: "Password updated" });

}

export default handler;