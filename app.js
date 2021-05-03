//Carregando módulos
    const express = require('express') 
    const handlebars = require('express-handlebars')
    const app = express()
    const admin = require('./routes/admin')
    const path = require('path')
    const mongoose = require('mongoose')
    const session = require('express-session') //Usado para definir sessões do navegador
    const flash = require('connect-flash')
    const moment = require('moment')
    
//Configurações
    // Configurar sessão
        app.use(session({
            secret: "blogapp",
            resave: true,
            saveUninitialized: true
        }))
    
        app.use(flash())
    
    // Middleware
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.erros_msg = req.flash("error_msg")
            next()
        })

    // Configurar BodyParser d o express
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    // Handlebars
        app.engine("handlebars", handlebars({
                defaultLayout: 'main',
                helpers: {
                    formatDate: (date) => {
                        return moment(date).format("DD/MM/YYYY")
                    }
                }}))
        app.set('view engine', 'handlebars')
    //Mongoose
        mongoose.Promise = global.Promise
        mongoose.connect("mongodb://localhost/blogapp", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }).then(() => {
            console.log("Conectado ao mongo")
        }).catch((err) => {
            console.log("Erro ao se conectar: " + err)
        })
    
    //Public
        app.use(express.static(path.join(__dirname,"public")))
        
    // //Exemplo de declaração de middleware
        // app.use((req, res, next) => {
        //     console.log("Midware")
        //     next()
        // })

//Rotas
    app.use('/admin', admin)

//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})