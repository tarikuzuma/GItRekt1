const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" }),
});

prisma.user
  .count()
  .then((count) => {
    console.log("query OK, user count =", count);
    return prisma.$disconnect();
  })
  .catch((err) => {
    console.error("QUERY FAILED:", err.message);
    process.exit(1);
  });
