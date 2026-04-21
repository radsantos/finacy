import { prisma } from "../lib/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1. Criar usuário padrão
  const user = await prisma.user.upsert({
    where: { email: "admin@financy.com" },
    update: {},
    create: {
      email: "admin@financy.com",
      name: "Admin",
      passwordHash: "123456",
    },
  });

  // 2. Criar categorias
  const categories = [
    "Alimentação",
    "Transporte",
    "Mercado",
    "Entretenimento",
    "Utilidades",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name,
        },
      },
      update: {},
      create: {
        name,
        userId: user.id,
      },
    });
  }

  console.log("✅ Seed finalizado!");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });