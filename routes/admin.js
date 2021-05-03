//Instanciado express para criação de routers / rotas
const express = require("express")
const router = express.Router()

//Importado mongoose
const mongoose = require('mongoose')

// --- Importação de models
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
// --- Fim da importação de models


// Rota da página inicial do painel admin
router.get('/', (req, res) => {
    res.render("admin/index")
})

// Rota da pagína de posts
router.get('/posts', (req, res) => {
    res.send("Página de posts")
})

// Rota das categorias de admin
router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})

// Rota para adição de categorias através do painel admin (Formulario)
router.get('/categorias/add', (req, res) => {
    res.render("admin/addcategoria")
})

//Rota para editar as categorias no painel admin
router.get("/categorias/edit/:id", (req, res) => {
    //Findone é semelhante ao select, recebendo parametros de 'WHERE'
    Categoria.findOne({
        _id: req.params.id
    }).lean().then((categoria) => {
        res.render("admin/editcategoria", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar categoria")
        res.redirect("/admin/categorias")
    })

})

// Enviar requisição de edição de categoria para o backend
router.post("/categorias/edit", (req, res) => {

    //Procura a categoria e depois faz a edição no mongo
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria atualizada com sucesso.")
            res.redirect("/admin/categorias")
        
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar categoria.")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })

})

// Rota tipo POST para enviar as informações para o banco de dados
router.post("/categorias/nova", (req, res) => {

    //Array de erros para verificação do formulário
    var erros = []

    // ----- Validações para verificar se o formulário está preenchido corretamente
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }

    if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria é muito pequena"})
    }
    // ------ Fim da validação de formulário

    if(erros.length > 0){
        res.render("admin/addcategoria", {erros: erros})
    } else {

        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            //O flash irá enviar uma mensagem para nossas variaveis globais "success_msg" e "error_msg"
            req.flash("success_msg", "Categoria criada com sucesso.")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar categoria: " + err)
            res.redirect("/admin")
        })
    }


})

//Rota para excluir a categoria no backend
router.post("/categorias/deletar", (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao excluir a categoria")
        res.redirect("/admin/categorias")

    })
})


// Rota para postagens
router.get("/postagens", (req, res) => {
    //O populate irá filtrar o campo 'categoria', semelhante a um join, para capturar o nome
    //Irá trazer a descrição da categoria através do id da categoria na pagina de postagens
    Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
    
})

// Rota para adição de postagens
router.get("/postagens/add", (req,res) => {
    //Irá popular o campo de categorias com todas as categorias criadas no banco
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
    
})


// Rota para salvar postagens no banco de dados
router.post("/postagens/nova", (req, res) => {
    var erros = []

    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, registre uma categoria."})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem", {erros: erros})
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso.")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro durante o salvamento da postagem.")
            res.redirect("/admin/postagens")
        })
    }
})


// Rota para página de editar postagem
router.get("/postagens/edit/:id", (req, res) => {

    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagem", {categorias: categorias, postagem: postagem})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve o erro ao carregar o formulário de edição.")
        res.redirect("/admin/postagens")
    })
    
})


// Rota para atualizar postagem

router.post("/postagem/edit", (req, res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        
        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição.")
        res.redirect("/admin/postagens")
    })
})

//Rota para excluir a postagem no backend
router.post("/postagens/deletar", (req, res) => {
    Postagem.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect("/admin/postagens")

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a postagem")
        res.redirect("/admin/postagens")

    })
})
//É necessário exportar o router para podermos acessar as rotas em outras partes do projeto
module.exports = router