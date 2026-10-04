import { SignJWT, jwtVerify } from "jose";

const cookieName = "admin_token";

function getSecret() {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error("Missing ADMIN_JWT_SECRET");
  return new TextEncoder().encode(s);
}

export function getAdminCookieName() {
  return cookieName;
}

export async function signAdminToken() {
  const secret = getSecret();
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyAdminToken(token: string) {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  return payload;
}