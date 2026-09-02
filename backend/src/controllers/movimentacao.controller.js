const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    try {
        const {
            tipo,
            quantidade,
            data,
            produtoId,
            usuarioId
        } = req.body;

        const quantidadeNumero = Number(quantidade);
        const produtoIdNumero = Number(produtoId);
        const usuarioIdNumero = Number(usuarioId);

        // Validação do tipo
        if (tipo !== "FABRICADO" && tipo !== "PEDIDO") {
            return res.status(400).json({
                mensagem: "Tipo de movimentação inválido."
            });
        }

        // Validação da quantidade
        if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
            return res.status(400).json({
                mensagem: "A quantidade deve ser maior que zero."
            });
        }

        // Validação do produto
        if (!Number.isInteger(produtoIdNumero)) {
            return res.status(400).json({
                mensagem: "Produto inválido."
            });
        }

        // Validação do usuário
        if (!Number.isInteger(usuarioIdNumero)) {
            return res.status(400).json({
                mensagem: "Usuário inválido."
            });
        }

        // Procura o produto
        const produto = await prisma.produto.findUnique({
            where: {
                id: produtoIdNumero
            }
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: "Produto não encontrado."
            });
        }

        // Procura o usuário
        const usuario = await prisma.usuario.findUnique({
            where: {
                id: usuarioIdNumero
            }
        });

        if (!usuario) {
            return res.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        // Verifica a data
        let dataMovimentacao = new Date();

        if (data) {
            const dataConvertida = new Date(data);

            if (isNaN(dataConvertida.getTime())) {
                return res.status(400).json({
                    mensagem: "Data da movimentação inválida."
                });
            }

            dataMovimentacao = dataConvertida;
        }

        // Calcula o novo estoque
        let novaQuantidade;

        if (tipo === "FABRICADO") {

            novaQuantidade =
                produto.quantidade + quantidadeNumero;

        } else {

            novaQuantidade =
                produto.quantidade - quantidadeNumero;

            if (novaQuantidade < 0) {
                return res.status(400).json({
                    mensagem: "Quantidade insuficiente em estoque."
                });
            }
        }

        // Salva movimentação e atualiza estoque
        const resultado = await prisma.$transaction(async (tx) => {

            const movimentacao = await tx.movimentacao.create({
                data: {
                    tipo: tipo,
                    quantidade: quantidadeNumero,
                    data: dataMovimentacao,
                    produtoId: produtoIdNumero,
                    usuarioId: usuarioIdNumero
                }
            });

            await tx.produto.update({
                where: {
                    id: produtoIdNumero
                },
                data: {
                    quantidade: novaQuantidade
                }
            });

            return movimentacao;
        });

        let mensagem = "Movimentação registrada com sucesso!";

        if (novaQuantidade < produto.estoqueMinimo) {
            mensagem += " Atenção: o estoque está abaixo do mínimo.";
        }

        return res.status(201).json({
            mensagem: mensagem,
            movimentacao: resultado,
            estoqueAtual: novaQuantidade
        });

    } catch (erro) {

        console.error("=================================");
        console.error("ERRO AO REGISTRAR MOVIMENTAÇÃO:");
        console.error(erro);
        console.error("=================================");

        return res.status(500).json({
            mensagem: "Erro interno ao registrar movimentação.",
            erro: erro.message
        });
    }
};


const listar = async (req, res) => {
    try {

        const lista = await prisma.movimentacao.findMany({
            include: {
                produto: true,
                usuario: true
            },
            orderBy: {
                data: "desc"
            }
        });

        res.status(200).json(lista);

    } catch (erro) {

        console.error("Erro ao listar movimentações:", erro);

        res.status(500).json({
            mensagem: "Erro ao listar movimentações.",
            erro: erro.message
        });
    }
};


const buscar = async (req, res) => {
    try {

        const { id } = req.params;

        const item = await prisma.movimentacao.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                produto: true,
                usuario: true
            }
        });

        if (!item) {
            return res.status(404).json({
                mensagem: "Movimentação não encontrada."
            });
        }

        res.status(200).json(item);

    } catch (erro) {

        console.error("Erro ao buscar movimentação:", erro);

        res.status(500).json({
            mensagem: "Erro ao buscar movimentação.",
            erro: erro.message
        });
    }
};


const atualizar = async (req, res) => {
    try {

        const { id } = req.params;
        const dados = req.body;

        const item = await prisma.movimentacao.update({
            where: {
                id: Number(id)
            },
            data: dados
        });

        res.status(200).json(item);

    } catch (erro) {

        console.error("Erro ao atualizar movimentação:", erro);

        res.status(500).json({
            mensagem: "Erro ao atualizar movimentação.",
            erro: erro.message
        });
    }
};


const excluir = async (req, res) => {
    try {

        const { id } = req.params;

        const item = await prisma.movimentacao.delete({
            where: {
                id: Number(id)
            }
        });

        res.status(200).json(item);

    } catch (erro) {

        console.error("Erro ao excluir movimentação:", erro);

        res.status(500).json({
            mensagem: "Erro ao excluir movimentação.",
            erro: erro.message
        });
    }
};


module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
};