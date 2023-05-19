import { hash, compare } from "bcryptjs";

export const hashPassword = async (password) => {
  return await hash(password, 12);
}

export const verifyPassword = async (password, hashedPassword) => {
  return await compare(password, hashedPassword);
}

export const checkIfSessionAuthenticated = (session) => {
  return session.status === "authenticated";
}
