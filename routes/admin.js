//Instanciado express para criação de routers / rotas
const express = require("express")
const router = express.Router()

//Intancia do middlerware 'eAdmin' para utilizarmos na definição das rotas para checar se o usuário é ou não administrador
const {eAdmin} = require("../helpers/eAdmin")  

//Importado mongoose
const mongoose = require('mongoose')

// --- Importação de models
require("../models/Categoria")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")
require("../models/Produtos")
const Produtos = mongoose.model("produtos")
// --- Fim da importação de models

// Configuração de upload de arquivos
const multer = require("multer")
const path = require("path")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "public/img/img-produto/")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage})

// Rota da página inicial do painel admin
router.get("/", eAdmin, (req, res) => {
    res.render("admin/index")
})

//Rota para página de usuários
router.get('/usuarios', eAdmin, (req, res) => {
    Usuario.find().lean().then((usuarios) => {
        res.render("admin/usuarios", {usuarios: usuarios})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/")
    })

})

router.get("/usuarios/edit/:id", eAdmin, (req, res) => {
    //Findone é semelhante ao select, recebendo parametros de 'WHERE'
    Usuario.findOne({
        _id: req.params.id
    }).lean().then((usuarios) => {
        res.render("admin/editusuario", {usuarios: usuarios})
    }).catch((err) => {
        req.flash("error_msg", "Erro ao encontrar usuário")
        res.redirect("/admin/usuarios")
    })

})

// Rota das categorias de admin
router.get('/produtos', eAdmin, (req, res) => {
    Produtos.find().lean().sort({date: "desc"}).then((produtos) => {
        res.render("admin/produtos/produtos", {produtos: produtos})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar os Produtos")
        res.redirect("/admin")
    })
    
})

//Rota para adição de produtos através do painel de admin
router.get("/produtos/add", eAdmin, (req,res) => {
    //Irá popular o campo de categorias com todas as categorias criadas no banco
    Categoria.find().lean().then((categoria) => {
        res.render("admin/produtos/addproduto", {categoria: categoria})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
    
})

//Rota para editar os produtos no painel admin
router.get("/produtos/edit/:id", eAdmin, (req, res) => {
    //Findone é semelhante ao select, recebendo parametros de 'WHERE'
    Produtos.findOne({_id: req.params.id}).lean().then((produtos) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/produtos/editproduto", {categorias: categorias, produtos: produtos})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/produtos")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve o erro ao carregar o formulário de edição.")
        res.redirect("/admin/produtos")
    })

})


// Enviar requisição de edição de categoria para o backend
router.post("/produtos/edit", [eAdmin, upload.single("file"), (req, res) => {

    //Procura a categoria e depois faz a edição no mongo
    Produtos.findOne({_id: req.body.id}).then((produtos) => {
        
        produtos.nome =  req.body.nome
        produtos.categoria = req.body.categoria
        produtos.descricao = req.body.descricao
        produtos.quantidade = req.body.quantidade
        produtos.preco = req.body.preco
        produtos.urlFoto = req.file.filename
        produtos.slug =  req.body.slug
        
    Produtos.save().then(() => {
            req.flash("success_msg", "Produto atualizado com sucesso.")
            res.redirect("/admin/produtos/produtos")
        
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar o produto.")
            res.redirect("/admin/produtos")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar o produto")
        res.redirect("/admin/produtos")
    })



}])

// Rota tipo POST para enviar as informações para o banco de dados
router.post("/produtos/nova", [eAdmin, upload.single("file"), (req, res) => {

    //Array de erros para verificação do formulário
    var erros = []

    // ----- Validações para verificar se o formulário está preenchido corretamente
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    // ------ Fim da validação de formulário

    if(erros.length > 0){
        res.render("admin/produtos/addproduto", {erros: erros})
    } else {

        const novoProduto = {
            nome: req.body.nome,
            categoria: req.body.categoria,
            descricao: req.body.descricao,
            quantidade: req.body.quantidade,
            preco: req.body.preco,
            urlFoto: req.file.filename,
            slug: req.body.slug
        }
    
        new Produtos(novoProduto).save().then(() => {
            //O flash irá enviar uma mensagem para nossas variaveis globais "success_msg" e "error_msg"
            req.flash("success_msg", "Produto criado com sucesso.")
            res.redirect("/admin/produtos")
        }).catch((err) => {
            req.flash("error_msg", "Erro ao salvar produto: " + err)
            res.redirect("/admin")
        })
    }


}])

//Rota para excluir o produto no backend
router.post("/produtos/deletar", eAdmin, (req, res) => {
    Produtos.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Produto deletado com sucesso")
        res.redirect("/admin/produtos")

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao excluir o produto")
        res.redirect("/admin/produtos")

    })
})

// Rota das categorias de admin
router.get('/categorias', eAdmin, (req, res) => {
    Categoria.find().lean().sort({date: "desc"}).then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((erro) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
    
})

// Rota para adição de categorias através do painel admin (Formulario)
router.get('/categorias/add', eAdmin,  (req, res) => {
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
router.post("/categorias/edit", eAdmin,  (req, res) => {

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
router.post("/categorias/nova", eAdmin, (req, res) => {

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
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao excluir a categoria")
        res.redirect("/admin/categorias")

    })
})


// Rota para postagens
router.get("/postagens", eAdmin, (req, res) => {
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
router.get("/postagens/add", eAdmin, (req,res) => {
    //Irá popular o campo de categorias com todas as categorias criadas no banco
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagem", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário.")
        res.redirect("/admin")
    })
    
})


// Rota para salvar postagens no banco de dados
router.post("/postagens/nova", eAdmin, (req, res) => {
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
router.get("/postagens/edit/:id", eAdmin,  (req, res) => {

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

router.post("/postagem/edit", eAdmin, (req, res) => {
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
router.post("/postagens/deletar", eAdmin, (req, res) => {
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