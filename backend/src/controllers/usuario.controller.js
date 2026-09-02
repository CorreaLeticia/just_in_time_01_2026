const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    const data = req.body;

    const item = await prisma.usuario.create({
        data
    });

    res.status(201).json(item);
};

const listar = async (req, res) => {
    const lista = await prisma.usuario.findMany();

    res.status(200).json(lista);
};

const buscar = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.usuario.findUnique({
        where: {
            id: Number(id)
        }
    });

    if (!item) {
        return res.status(404).json({
            mensagem: "Usuário não encontrado."
        });
    }

    res.status(200).json(item);
};

const atualizar = async (req, res) => {
    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.usuario.update({
        where: {
            id: Number(id)
        },
        data: dados
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {
    const { id } = req.params;

    const item = await prisma.usuario.delete({
        where: {
            id: Number(id)
        }
    });

    res.status(200).json(item);
};

const login = async (req, res) => {
    const { email, senha } = req.body;

    const usuario = await prisma.usuario.findUnique({
        where: {
            email: email
        }
    });

    if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({
            mensagem: "E-mail ou senha incorretos."
        });
    }

    res.status(200).json({
        mensagem: "Login realizado com sucesso.",
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }
    });
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir,
    login
};