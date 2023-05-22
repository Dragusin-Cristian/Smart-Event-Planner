import { hashPassword } from "../../../utils/AuthUtils";
import { connectClient } from "../../../utils/MongoDbUtils";
import { v4 as uuidv4 } from 'uuid';
import { sendActivateAccountMail } from "../../../utils/mailUtils";

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: "Incorrect method." });
    return;
  }

  const data = req.body;
  const { email, password, username } = data;

  if (!email || !email.includes("@") || !password || password.trim().length < 7 || !username || username.trim().length === 0) {
    res.status(422).json({ message: "Invalid credentials!" })
    return;
  }

  const client = await connectClient();
  const db = client.db();
  const existingUser = await db.collection("users").findOne({ email: email });

  if (existingUser) {
    client.close();
    res.status(422).json({ message: "User already exists!" });
    return;
  }

  const hashedPassword = await hashPassword(password);

  const uuid = uuidv4();

  await db.collection("users").insertOne({
    email: email,
    password: hashedPassword,
    username: username,
    activationCode: uuid,
    activated: false
  });

  client.close();

  sendActivateAccountMail(email, username, uuid);
  res.status(201).json({ message: "Created user!" });

}

export default handler;