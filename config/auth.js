//Bibliotecas
    const localStrategy = require("passport-local").Strategy //Autenticação local
    const mongoose = require("mongoose") //Database
    const bcrypt = require("bcryptjs") //Encriptador de senha

//Model de usuário
require("../models/Usuario")
const Usuario = mongoose.model("usuarios")

module.exports = function(passport){

    //Autenticação através do formulário de login 
    passport.use(new localStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        //Procura o usuário através do email
        Usuario.findOne({email: email}).then((usuario) => {
            //Caso não encontre o usuário retorna uma mensagem de erro
            if(!usuario){
                return done(null, false, {message: "Conta inexistente."})
            } 
            //Caso o usuário exista, ele irá comparar a senha digitada com a senha do banco de dados
            bcrypt.compare(senha, usuario.senha, (erro, batem) => {
                //Se as senhas baterem então ira retornar as informações de usuário
                if(batem){
                    return done(null, usuario)
                } else {
                    //Retorna mensagem de erro caso a senha esteja incorreta
                    return done(null, false, {message: "Senha incorreta"})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done) => {
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        Usuario.findById(id, (err, usuario) => {
            done(err, usuario)
        })
    })


}