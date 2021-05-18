//Carregando módulos
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require("../models/Usuario")
    const Usuario = mongoose.model("usuarios")
    const bcrypt = require("bcrypt") //Encriptar senha
    const passport = require('passport') //Autenticar usuário

    // Configuração de upload de arquivos
    const multer = require("multer")
    const path = require("path")

    const storage = multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, "public/img/post-img/")
        },
        filename: function(req, file, cb){
            cb(null, file.originalname + Date.now() + path.extname(file.originalname))
        }
    })
    const upload = multer({storage})

//Rota para página de registro
router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})


//Validação do formulário de registro
router.post("/registro", upload.single("file"), (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erros.push({texto: "Email inválido"})
    }

    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erros.push({texto: "Senha inválida"})
    }

    if(req.body.senha.length < 4) {
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto: "As senhas não coincidem"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros: erros})
    } else {
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "E-mail já cadastrado.")
                res.redirect("/usuarios/registro")
            } else {
                
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha,
                    urlFoto: req.file.filename
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash("error_msg", "Houve um erro ao salvar um usuário.")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash
                        novoUsuario.save().then(() =>{
                            req.flash("success_msg", "Usuário criado com sucesso.")
                            res.redirect("/")
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao criar o usuário.")
                            res.redirect("/usuarios/registro")
                        })
                    })
                })

                

            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    }

})


//Rota para a tela de login 

router.get("/login", (req, res) => {
    res.render("usuarios/login")
})

//Rota de login para autenticar o usuário
router.post("/login", (req, res, next) => {
    //Função de autenticação do passport, recebe a instrução local pois é o tipo de autenticação utilizada
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)


})

//Efetua o logout do usuário
router.get("/logout", (req, res) => {
    req.logout()
    req.flash("success_msg", "Sessão finalizada.")
    res.redirect("/")
})

module.exports = router