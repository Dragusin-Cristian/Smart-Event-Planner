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
    client.close();
    res.status(404).json({ message: "User not found" });
    return;
  }

  const currentPassword = user.password;

  const passwordsAreEqual = await verifyPassword(oldPassword, currentPassword);

  if (!passwordsAreEqual) {
    client.close();
    res.status(403).json({ message: "The password you entered is wrong, cannot authorize using this password." });
    return;
  }

  if(!oldPassword || oldPassword.trim().length === 0 || !newPassword || newPassword.trim().length === 0){
    client.close()
    res.status(403).json({message: "Entered password is not valid."});
    return;
  }

  if(oldPassword === newPassword){
    client.close()
    res.status(403).json({message: "The new password is the same as the old one."});
    return;
  }

  const hashedPassword = await hashPassword(newPassword);
  await usersCollection.updateOne({ email: userEmail }, { $set: { password: hashedPassword } });

  client.close();
  res.status(200).json({ message: "Password updated" });

}

export default handler;