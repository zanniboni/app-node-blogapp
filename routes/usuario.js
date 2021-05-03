//Carregando módulos
    const express = require('express')
    const router = express.Router()
    const mongoose = require('mongoose')
    require("../models/Usuario")
    const Usuario = mongoose.model("usuarios")


//Rota para página de registro
router.get("/registro", (req, res) => {
    res.render("usuarios/registro")
})


//Validação do formulário de login
router.post("/registro", (req, res) => {
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

    }

})
module.exports = router