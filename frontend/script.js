const API = "http://localhost:3000";

let usuarioLogado = null;
let produtos = [];
let movimentacoes = [];

const telaLogin = document.getElementById("tela-login");
const sistema = document.getElementById("sistema");
const formLogin = document.getElementById("form-login");
const mensagemLogin = document.getElementById("mensagem-login");
const nomeUsuario = document.getElementById("nome-usuario");
const menuItems = document.querySelectorAll(".menu-item");
const paginas = document.querySelectorAll(".pagina");
const tituloPagina = document.getElementById("titulo-pagina");
const btnLogout = document.getElementById("btn-logout");
const tabelaProdutos = document.getElementById("tabela-produtos");
const modalProduto = document.getElementById("modal-produto");
const btnNovoProduto = document.getElementById("btn-novo-produto");
const fecharModal = document.getElementById("fechar-modal");
const cancelarModal = document.getElementById("cancelar-modal");
const formProduto = document.getElementById("form-produto");
const tituloModal = document.getElementById("titulo-modal");
const produtoId = document.getElementById("produto-id");
const nomeProduto = document.getElementById("nome-produto");
const descricaoProduto = document.getElementById("descricao-produto");
const custoProduto = document.getElementById("custo-produto");
const estoqueProduto = document.getElementById("estoque-produto");
const minimoProduto = document.getElementById("minimo-produto");
const buscaProduto = document.getElementById("busca-produto");
const btnBuscar = document.getElementById("btn-buscar");
const selectProduto = document.getElementById("produto-movimentacao");
const tipoMovimentacao = document.getElementById("tipo-movimentacao");
const quantidadeMovimentacao = document.getElementById("quantidade");
const dataMovimentacao = document.getElementById("data-movimentacao");
const formMovimentacao = document.getElementById("form-movimentacao");
const alertaEstoque = document.getElementById("alerta-estoque");
const tabelaMovimentacoes = document.getElementById("tabela-movimentacoes");

formLogin.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!email || !senha) {
        mensagemLogin.textContent = "Preencha o e-mail e a senha.";
        mensagemLogin.style.color = "#b91c1c";
        return;
    }

    try {
        const resposta = await fetch(`${API}/usuarios/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemLogin.textContent =
                dados.mensagem || "E-mail ou senha incorretos.";
            mensagemLogin.style.color = "#b91c1c";
            return;
        }

        usuarioLogado = dados.usuario;
        nomeUsuario.textContent = usuarioLogado.nome;
        telaLogin.classList.remove("ativa");
        sistema.classList.add("ativa");
        mensagemLogin.textContent = "";

        await carregarProdutosAPI();
        await carregarMovimentacoesAPI();
        carregarDashboard();

    } catch (erro) {
        console.error("Erro no login:", erro);
        mensagemLogin.textContent =
            "Não foi possível conectar ao servidor.";
        mensagemLogin.style.color = "#b91c1c";
    }
});

btnLogout.addEventListener("click", function () {
    usuarioLogado = null;
    sistema.classList.remove("ativa");
    telaLogin.classList.add("ativa");
    formLogin.reset();
    abrirPagina("dashboard");
});

menuItems.forEach(function (item) {
    item.addEventListener("click", function () {
        const nomeTela = item.dataset.tela;
        abrirPagina(nomeTela);
    });
});

async function abrirPagina(nomeTela) {
    paginas.forEach(function (pagina) {
        pagina.classList.remove("ativa");
    });

    menuItems.forEach(function (item) {
        item.classList.remove("ativo");
    });

    const paginaSelecionada =
        document.getElementById(nomeTela);

    const menuSelecionado =
        document.querySelector(
            `.menu-item[data-tela="${nomeTela}"]`
        );

    if (paginaSelecionada) {
        paginaSelecionada.classList.add("ativa");
    }

    if (menuSelecionado) {
        menuSelecionado.classList.add("ativo");
    }

    const titulos = {
        dashboard: "Dashboard",
        produtos: "Produtos",
        producao: "Gestão de Produção"
    };

    tituloPagina.textContent =
        titulos[nomeTela] || "Just in Time";

    if (nomeTela === "dashboard") {
        await carregarProdutosAPI();
        await carregarMovimentacoesAPI();
        carregarDashboard();
    }

    if (nomeTela === "produtos") {
        await carregarProdutosAPI();
        carregarProdutos();
    }

    if (nomeTela === "producao") {
        await carregarProdutosAPI();
        await carregarMovimentacoesAPI();
        carregarProdutosSelect();
        carregarMovimentacoes();
        verificarTodosEstoques();
    }
}

async function carregarProdutosAPI() {
    try {
        const resposta =
            await fetch(`${API}/produtos/listar`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar produtos.");
        }

        const dados = await resposta.json();

        produtos = dados.map(function (produto) {
            return {
                id: produto.id,
                nome: produto.nome,
                descricao: produto.descricao,
                custo: Number(produto.custo),
                estoque: Number(produto.quantidade),
                minimo: Number(produto.estoqueMinimo)
            };
        });

        return produtos;

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
        return [];
    }
}

async function carregarMovimentacoesAPI() {
    try {
        const resposta =
            await fetch(`${API}/movimentacoes/listar`);

        if (!resposta.ok) {
            throw new Error("Erro ao carregar movimentações.");
        }

        const dados = await resposta.json();

        movimentacoes = dados.map(function (movimentacao) {
            return {
                id: movimentacao.id,
                produtoId: movimentacao.produtoId,
                produtoNome:
                    movimentacao.produto
                        ? movimentacao.produto.nome
                        : "Produto não encontrado",
                tipo:
                    (movimentacao.tipo || "").toLowerCase(),
                quantidade:
                    Number(movimentacao.quantidade),
                data:
                    movimentacao.data,
                usuario:
                    movimentacao.usuario
                        ? movimentacao.usuario.nome
                        : "Usuário não encontrado"
            };
        });

        carregarMovimentacoes();
        carregarDashboard();

        return movimentacoes;

    } catch (erro) {
        console.error(
            "Erro ao carregar movimentações:",
            erro
        );

        return [];
    }
}

function carregarDashboard() {
    const totalProdutos =
        document.getElementById("total-produtos");

    const estoqueBaixo =
        document.getElementById("estoque-baixo");

    const totalPedidos =
        document.getElementById("total-pedidos");

    const totalProducoes =
        document.getElementById("total-producoes");

    totalProdutos.textContent =
        produtos.length;

    const produtosEstoqueBaixo =
        produtos.filter(function (produto) {
            return produto.estoque < produto.minimo;
        });

    estoqueBaixo.textContent =
        produtosEstoqueBaixo.length;

    const pedidos =
        movimentacoes.filter(function (movimentacao) {
            return movimentacao.tipo === "pedido";
        });

    const producoes =
        movimentacoes.filter(function (movimentacao) {
            return movimentacao.tipo === "fabricado";
        });

    totalPedidos.textContent =
        pedidos.length;

    totalProducoes.textContent =
        producoes.length;
}

function carregarProdutos(lista = produtos) {
    tabelaProdutos.innerHTML = "";

    if (lista.length === 0) {
        tabelaProdutos.innerHTML = `
            <tr>
                <td colspan="7">
                    Nenhum produto encontrado.
                </td>
            </tr>
        `;

        return;
    }

    lista.forEach(function (produto) {
        const estoqueBaixo =
            produto.estoque < produto.minimo;

        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td>${produto.id}</td>
            <td>
                <strong>${produto.nome}</strong>
            </td>
            <td>
                ${produto.descricao}
            </td>
            <td>
                R$ ${Number(produto.custo)
                    .toFixed(2)
                    .replace(".", ",")}
            </td>
            <td>
                ${produto.estoque}
                ${estoqueBaixo ? " ⚠️" : ""}
            </td>
            <td>
                ${produto.minimo}
            </td>
            <td>
                <button
                    class="btn-editar"
                    onclick="editarProduto(${produto.id})"
                >
                    Editar
                </button>

                <button
                    class="btn-excluir"
                    onclick="excluirProduto(${produto.id})"
                >
                    Excluir
                </button>
            </td>
        `;

        tabelaProdutos.appendChild(linha);
    });
}

btnBuscar.addEventListener(
    "click",
    pesquisarProduto
);

buscaProduto.addEventListener(
    "keyup",
    function (event) {
        if (event.key === "Enter") {
            pesquisarProduto();
        }
    }
);

function pesquisarProduto() {
    const termo =
        buscaProduto.value.trim().toLowerCase();

    if (!termo) {
        carregarProdutos();
        return;
    }

    const resultado =
        produtos.filter(function (produto) {
            return (
                produto.nome
                    .toLowerCase()
                    .includes(termo)
                ||
                produto.descricao
                    .toLowerCase()
                    .includes(termo)
            );
        });

    carregarProdutos(resultado);
}

btnNovoProduto.addEventListener(
    "click",
    function () {
        abrirModalNovoProduto();
    }
);

function abrirModalNovoProduto() {
    formProduto.reset();
    produtoId.value = "";
    tituloModal.textContent =
        "Novo produto";
    modalProduto.classList.add("ativo");
}

fecharModal.addEventListener(
    "click",
    fecharModalProduto
);

cancelarModal.addEventListener(
    "click",
    fecharModalProduto
);

modalProduto.addEventListener(
    "click",
    function (event) {
        if (event.target === modalProduto) {
            fecharModalProduto();
        }
    }
);

function fecharModalProduto() {
    modalProduto.classList.remove("ativo");
}

formProduto.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        const nome =
            nomeProduto.value.trim();

        const descricao =
            descricaoProduto.value.trim();

        const custo =
            Number(custoProduto.value);

        const estoque =
            Number(estoqueProduto.value);

        const minimo =
            Number(minimoProduto.value);

        if (!nome || !descricao) {
            alert(
                "Preencha todos os campos obrigatórios."
            );
            return;
        }

        if (custo < 0 || isNaN(custo)) {
            alert("Informe um custo válido.");
            return;
        }

        if (estoque < 0 || isNaN(estoque)) {
            alert(
                "Informe uma quantidade de estoque válida."
            );
            return;
        }

        if (minimo < 0 || isNaN(minimo)) {
            alert(
                "Informe um estoque mínimo válido."
            );
            return;
        }

        const dados = {
            nome: nome,
            descricao: descricao,
            custo: custo,
            quantidade: estoque,
            estoqueMinimo: minimo
        };

        try {
            let resposta;

            if (produtoId.value) {
                const id =
                    Number(produtoId.value);

                resposta =
                    await fetch(
                        `${API}/produtos/atualizar/${id}`,
                        {
                            method: "PUT",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(dados)
                        }
                    );
            } else {
                resposta =
                    await fetch(
                        `${API}/produtos/cadastrar`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body:
                                JSON.stringify(dados)
                        }
                    );
            }

            const resultado =
                await resposta.json();

            if (!resposta.ok) {
                alert(
                    resultado.mensagem ||
                    "Não foi possível salvar o produto."
                );
                return;
            }

            alert(
                produtoId.value
                    ? "Produto atualizado com sucesso."
                    : "Produto cadastrado com sucesso."
            );

            fecharModalProduto();

            await carregarProdutosAPI();
            carregarProdutos();
            carregarDashboard();
            carregarProdutosSelect();

        } catch (erro) {
            console.error(
                "Erro ao salvar produto:",
                erro
            );

            alert(
                "Erro ao conectar com o servidor."
            );
        }
    }
);

async function editarProduto(id) {
    const produto =
        produtos.find(function (item) {
            return item.id === id;
        });

    if (!produto) {
        return;
    }

    produtoId.value =
        produto.id;

    nomeProduto.value =
        produto.nome;

    descricaoProduto.value =
        produto.descricao;

    custoProduto.value =
        produto.custo;

    estoqueProduto.value =
        produto.estoque;

    minimoProduto.value =
        produto.minimo;

    tituloModal.textContent =
        "Editar produto";

    modalProduto.classList.add("ativo");
}

async function excluirProduto(id) {
    const produto =
        produtos.find(function (item) {
            return item.id === id;
        });

    if (!produto) {
        return;
    }

    const confirmar =
        confirm(
            `Deseja realmente excluir o produto "${produto.nome}"?`
        );

    if (!confirmar) {
        return;
    }

    try {
        const resposta =
            await fetch(
                `${API}/produtos/excluir/${id}`,
                {
                    method: "DELETE"
                }
            );

        const resultado =
            await resposta.json();

        if (!resposta.ok) {
            alert(
                resultado.mensagem ||
                "Não foi possível excluir o produto."
            );
            return;
        }

        alert(
            "Produto excluído com sucesso."
        );

        await carregarProdutosAPI();
        carregarProdutos();
        carregarDashboard();
        carregarProdutosSelect();

    } catch (erro) {
        console.error(
            "Erro ao excluir produto:",
            erro
        );

        alert(
            "Erro ao conectar com o servidor."
        );
    }
}

function carregarProdutosSelect() {
    selectProduto.innerHTML = `
        <option value="">
            Selecione um produto
        </option>
    `;

    const produtosOrdenados =
        [...produtos].sort(
            function (a, b) {
                return a.nome.localeCompare(b.nome);
            }
        );

    produtosOrdenados.forEach(
        function (produto) {
            const option =
                document.createElement("option");

            option.value =
                produto.id;

            option.textContent =
                produto.nome;

            selectProduto.appendChild(option);
        }
    );
}

function definirDataAtual() {
    const hoje =
        new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");

    dataMovimentacao.value =
        `${ano}-${mes}-${dia}`;
}

formMovimentacao.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();

        if (!usuarioLogado || !usuarioLogado.id) {
            alert(
                "Sua sessão expirou. Faça login novamente."
            );
            return;
        }

        const idProduto =
            Number(selectProduto.value);

        const tipo =
            tipoMovimentacao.value;

        const quantidade =
            Number(quantidadeMovimentacao.value);

        const data =
            dataMovimentacao.value;

        if (!idProduto) {
            alert(
                "Selecione um produto."
            );
            return;
        }

        if (!tipo) {
            alert(
                "Selecione o tipo de movimentação."
            );
            return;
        }

        if (
            !Number.isInteger(quantidade) ||
            quantidade <= 0
        ) {
            alert(
                "Informe uma quantidade válida."
            );
            return;
        }

        if (!data) {
            alert(
                "Informe a data da movimentação."
            );
            return;
        }

        const produto =
            produtos.find(function (item) {
                return item.id === idProduto;
            });

        if (!produto) {
            alert(
                "Produto não encontrado."
            );
            return;
        }

        const tipoAPI =
            tipo.toUpperCase();

        const dadosMovimentacao = {
            tipo: tipoAPI,
            quantidade: quantidade,
            data: data,
            produtoId: idProduto,
            usuarioId: Number(usuarioLogado.id)
        };

        console.log(
            "DADOS ENVIADOS:",
            dadosMovimentacao
        );

        try {
            const resposta =
                await fetch(
                    `${API}/movimentacoes/cadastrar`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:
                            JSON.stringify(
                                dadosMovimentacao
                            )
                    }
                );

            const textoResposta =
                await resposta.text();

            console.log(
                "RESPOSTA DO SERVIDOR:",
                textoResposta
            );

            let resultado;

            try {
                resultado =
                    JSON.parse(textoResposta);
            } catch (erroJSON) {
                console.error(
                    "Resposta não é JSON:",
                    textoResposta
                );

                alert(
                    "O servidor retornou um erro. Verifique o terminal do backend."
                );

                return;
            }

            if (!resposta.ok) {
                alert(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível registrar a movimentação."
                );

                return;
            }

            await carregarProdutosAPI();
            await carregarMovimentacoesAPI();

            const produtoAtualizado =
                produtos.find(function (item) {
                    return item.id === idProduto;
                });

            if (
                produtoAtualizado &&
                produtoAtualizado.estoque <
                produtoAtualizado.minimo
            ) {
                alertaEstoque.textContent =
                    `Atenção: o estoque de "${produtoAtualizado.nome}" ` +
                    `está abaixo do mínimo configurado. ` +
                    `Estoque atual: ${produtoAtualizado.estoque}. ` +
                    `Mínimo: ${produtoAtualizado.minimo}.`;

                alertaEstoque.classList.add("ativo");

            } else {
                verificarTodosEstoques();
            }

            alert(
                resultado.mensagem ||
                "Movimentação registrada com sucesso."
            );

            formMovimentacao.reset();
            definirDataAtual();
            carregarProdutosSelect();
            carregarMovimentacoes();
            carregarDashboard();

        } catch (erro) {
            console.error(
                "Erro ao registrar movimentação:",
                erro
            );

            alert(
                "Erro ao conectar com o servidor."
            );
        }
    }
);

function verificarEstoqueMinimo(produto) {
    if (
        produto.estoque <
        produto.minimo
    ) {
        alertaEstoque.textContent =
            `Atenção: o estoque de "${produto.nome}" ` +
            `está abaixo do mínimo configurado. ` +
            `Estoque atual: ${produto.estoque}. ` +
            `Mínimo: ${produto.minimo}.`;

        alertaEstoque.classList.add("ativo");

        return true;
    }

    return false;
}

function verificarTodosEstoques() {
    const produtoBaixo =
        produtos.find(function (produto) {
            return (
                produto.estoque <
                produto.minimo
            );
        });

    if (produtoBaixo) {
        verificarEstoqueMinimo(
            produtoBaixo
        );
    } else {
        alertaEstoque.textContent = "";

        alertaEstoque.classList.remove(
            "ativo"
        );
    }
}

function carregarMovimentacoes() {
    tabelaMovimentacoes.innerHTML = "";

    if (movimentacoes.length === 0) {
        tabelaMovimentacoes.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhuma movimentação registrada.
                </td>
            </tr>
        `;

        return;
    }

    const lista =
        [...movimentacoes].reverse();

    lista.forEach(
        function (movimentacao) {
            const linha =
                document.createElement("tr");

            const tipoFormatado =
                movimentacao.tipo === "fabricado"
                    ? "Fabricado"
                    : "Pedido";

            linha.innerHTML = `
                <td>
                    ${movimentacao.produtoNome}
                </td>
                <td>
                    ${tipoFormatado}
                </td>
                <td>
                    ${movimentacao.quantidade}
                </td>
                <td>
                    ${formatarData(
                        movimentacao.data
                    )}
                </td>
                <td>
                    ${movimentacao.usuario}
                </td>
            `;

            tabelaMovimentacoes.appendChild(
                linha
            );
        }
    );
}

function formatarData(data) {
    if (!data) {
        return "-";
    }

    if (data.includes("T")) {
        const dataObj =
            new Date(data);

        return dataObj.toLocaleDateString(
            "pt-BR"
        );
    }

    const partes =
        data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return (
        `${partes[2]}/` +
        `${partes[1]}/` +
        `${partes[0]}`
    );
}

document.addEventListener(
    "DOMContentLoaded",
    function () {
        definirDataAtual();
    }
);