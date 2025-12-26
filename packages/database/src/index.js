import { PrismaClient } from "@prisma/client";
if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL is not defined in environment variables");
}
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
export * from "@prisma/client";
