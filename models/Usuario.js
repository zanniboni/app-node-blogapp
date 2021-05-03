// Criado schema do mongoDB para criação de categorias
const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//O schema serve para podermos inserir, deletar, atualizar e consultar informações mais rapidamente no mongoDB
const Usuario = new Schema({
    nome: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    senha: {
        type: String,
        require: true
    },
    isAdmin: {
        type: Number,
        default: 0
    }
})

mongoose.model("usuarios", Usuario)