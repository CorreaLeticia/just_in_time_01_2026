const { PrismaClient } = require("@prisma/client");
const { PrismaMariaDb } = require("@prisma/adapter-mariadb");

const adapter = new PrismaMariaDb({
  host: "localhost",
  user: "root",
  password: "",
  database: "preparacao_db",
  connectionLimit: 5,
});

const prisma = new PrismaClient({
  adapter,
});

module.exports = prisma;