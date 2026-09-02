const express = require("express");
const cors = require("cors");

const produtoRoutes = require("./src/routes/produto.routes");
const usuarioRoutes = require("./src/routes/usuario.routes");
const movimentacaoRoutes = require("./src/routes/movimentacao.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/produtos", produtoRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/movimentacoes", movimentacaoRoutes);

app.get("/", (req, res) => {
    res.json({
        mensagem: "API Just in Time funcionando!"
    });
});

console.log("ROTAS DE USUARIO CARREGADAS");

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});