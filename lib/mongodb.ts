import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
        isConnected: boolean;
      }
    | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

const cached = global.mongooseCache || { conn: null, promise: null, isConnected: false };
global.mongooseCache = cached;

export async function connectToDatabase() {
  if (!MONGODB_URI) return null;

  if (cached.isConnected && cached.conn) return cached.conn;
  if (mongoose.connection.readyState === 1) {
    cached.isConnected = true;
    cached.conn = mongoose;
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "zyroshield",
      serverSelectionTimeoutMS: 4000
    });
  }

  try {
    cached.conn = await cached.promise;
    cached.isConnected = true;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.isConnected = false;
    console.error("MongoDB unavailable, continuing with in-memory mode.", error);
    return null;
  }
}
