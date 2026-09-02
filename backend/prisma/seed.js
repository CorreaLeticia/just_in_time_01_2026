require("dotenv").config();

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

async function main() {
  console.log("Iniciando população do banco...");

  // =========================
  // USUÁRIOS
  // =========================

  const usuario1 = await prisma.usuario.create({
    data: {
      nome: "Administrador",
      email: "admin@justintime.com",
      senha: "123456",
    },
  });

  const usuario2 = await prisma.usuario.create({
    data: {
      nome: "João Silva",
      email: "joao@justintime.com",
      senha: "123456",
    },
  });

  const usuario3 = await prisma.usuario.create({
    data: {
      nome: "Maria Souza",
      email: "maria@justintime.com",
      senha: "123456",
    },
  });

  // =========================
  // PRODUTOS
  // =========================

  const produto1 = await prisma.produto.create({
    data: {
      nome: "Porta-Retrato MDF",
      descricao: "Porta-retrato produzido em MDF.",
      custo: 15.90,
      quantidade: 20,
      estoqueMinimo: 5,
    },
  });

  const produto2 = await prisma.produto.create({
    data: {
      nome: "Caixa Organizadora MDF",
      descricao: "Caixa organizadora produzida em MDF.",
      custo: 22.50,
      quantidade: 12,
      estoqueMinimo: 5,
    },
  });

  const produto3 = await prisma.produto.create({
    data: {
      nome: "Suporte para Celular MDF",
      descricao: "Suporte para celular produzido em MDF.",
      custo: 8.90,
      quantidade: 3,
      estoqueMinimo: 5,
    },
  });

  // =========================
  // MOVIMENTAÇÕES
  // =========================

  await prisma.movimentacao.create({
    data: {
      tipo: "FABRICADO",
      quantidade: 10,
      data: new Date("2026-09-01"),
      produtoId: produto1.id,
      usuarioId: usuario1.id,
    },
  });

  await prisma.movimentacao.create({
    data: {
      tipo: "PEDIDO",
      quantidade: 5,
      data: new Date("2026-09-01"),
      produtoId: produto2.id,
      usuarioId: usuario2.id,
    },
  });

  await prisma.movimentacao.create({
    data: {
      tipo: "PEDIDO",
      quantidade: 2,
      data: new Date("2026-09-02"),
      produtoId: produto3.id,
      usuarioId: usuario3.id,
    },
  });

  console.log("Banco populado com sucesso!");
}

main()
  .catch((erro) => {
    console.error("Erro ao popular o banco:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });