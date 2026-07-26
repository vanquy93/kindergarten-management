process.env.DATABASE_URL = "file:./dev.db";
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');

async function main() {
  const libsql = createClient({ url: 'file:./dev.db' });
  const adapter = new PrismaLibSql(libsql);
  const prisma = new PrismaClient({ adapter });
  const students = await prisma.student.findMany();
  console.log('Students:', students);
}
main().catch(console.error);
