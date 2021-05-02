//Carregando módulos
    const express = require('express')
    const handlebars = require('express-handlebars')
    const app = express()
    const admin = require('./routes/admin')
    //const mongoose = require('mongoose')
    
//Configurações
    // Configurar BodyParser d o express
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    // Handlebars
        app.engine("handlebars", handlebars({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')

//Rotas
    app.use('/admin', admin)
    
//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})