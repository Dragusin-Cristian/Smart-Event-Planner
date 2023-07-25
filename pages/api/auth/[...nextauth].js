import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../utils/AuthUtils";
import { connectClient } from "../../../utils/MongoDbUtils";

export const authOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        const client = await connectClient();
        const usersCollection = client.db().collection("users");
        const user = await usersCollection.findOne({ email: credentials.email });

        if (!user) {
          client.close();
          throw new Error("User not found.");
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        if (!isValid) {
          client.close();
          throw new Error("Invalid password.");
        }

        if (!user.activated) {
          client.close();
          throw new Error("You need to activate your account first.");
        }

        client.close();
        return { email: user.email, username: user.username };

      }
    })
  ],
  callbacks: {
    async session({ session, token, user }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken
      session.user.id = token.id

      const client = await connectClient();
      const usersCollection = client.db().collection("users");
      const u = await usersCollection.findOne({ email: session.user.email });
      client.close();

      session.user.username = u.username;
      session.user.userId = u._id.toString();

      return session
    }
  }
}

export default NextAuth(authOptions);
