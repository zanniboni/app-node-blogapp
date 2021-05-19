// Criado schema do mongoDB para criação de categorias
const mongoose = require('mongoose')
const Schema = mongoose.Schema;


//O schema serve para podermos inserir, deletar, atualizar e consultar informações mais rapidamente no mongoDB
const Produtos = new Schema({
    nome: {
        type: String,
        require: true
    },
    categoria: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        requide: true
    },
    quantidade: {
        type: Number,
        require: true
    },
    preco: {
        type: Number,
        default: 0
    },
    urlFoto: {
        type: String,
        require: false
    },    
    slug: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("produtos", Produtos)