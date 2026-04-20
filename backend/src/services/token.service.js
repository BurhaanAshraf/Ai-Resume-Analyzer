import jwt from "jsonwebtoken";
import { getRedis } from "../config/redis.js";

const ACCESS_TTL = 15 * 60; // 15 minutes in seconds
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export function generateAccessToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
  });
}

export function generateRefreshToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
}

export async function storeRefreshToken(userId, token) {
  const redis = getRedis();
  await redis.set(`refresh:${userId}`, token, { ex: REFRESH_TTL });
}

export async function validateStoredRefreshToken(userId, token) {
  const redis = getRedis();
  const stored = await redis.get(`refresh:${userId}`);
  return stored === token;
}

export async function revokeRefreshToken(userId) {
  const redis = getRedis();
  await redis.del(`refresh:${userId}`);
}

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: REFRESH_TTL * 1000,
  path: "/api/auth",
};
