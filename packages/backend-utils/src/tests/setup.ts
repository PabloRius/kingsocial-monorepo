import { execSync } from "child_process";
import { MongoMemoryServer } from "mongodb-memory-server";
import path from "path";

let mongo: MongoMemoryServer;

export const setupTestDB = async () => {
  mongo = await MongoMemoryServer.create();
  const baseUri = mongo.getUri();
  const uri = baseUri.endsWith("/") ? `${baseUri}test` : `${baseUri}/test`;

  process.env.DATABASE_URL = uri;

  const schemaPath = path.resolve(
    __dirname,
    "../../../database/prisma/schema.prisma"
  );

  try {
    console.log(`🚀 Synchronizing Prisma schema from: ${schemaPath}`);
    execSync(`npx prisma db push --schema="${schemaPath}" --skip-generate`, {
      env: process.env,
      stdio: "inherit",
    });
  } catch (error) {
    console.error("❌ Failed to push Prisma schema to Memory DB:", error);
    throw error;
  }
};

export const stopTestDB = async () => {
  await mongo.stop();
};
