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
    require("./models/Postagem")
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria")
    const Categoria = mongoose.model("categorias")
    const usuarios = require('./routes/usuario')

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
            useUnifiedTopology: true,
            useCreateIndex: true
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

    //Rota para a página inicial, responsável por listar todas as postagens
    app.get("/", (req, res) => {
        Postagem.find().populate("categoria").sort({data: "desc"}).lean().then((postagens) => {
            res.render("index", {postagens: postagens})

        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao exibir as postagens.")
            res.redirect("/404")
        })
        
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })
    
    //Rota para visualizar as postagens na página personalizada de cada um
    app.get("/postagem/:slug", (req, res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render("postagem/index", {postagem: postagem})
            }else{
                req.flash("error_msg", "Essa postagem não existe")
                res.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })
    })

    //Rota para página de categorias
    app.get("/categorias", (req, res) => {
        Categoria.find().lean().then((categorias) => {
            res.render("categorias/index", {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/")
        })
    })

    //Definido rota para slug da categoria
    //Irá listar todas as postagens que possuem a categoria selecionada
    app.get("/categorias/:slug", (req, res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {

                    res.render("categorias/postagens", {postagens: postagens, categoria: categoria})
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro ao listar os posts")
                    res.redirect("/")
                })


            }else {
                req.flash("error_msg", "Categoria inexistente")
                req.redirect("/")
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao carregar a página da categoria.")
            res.redirect("/")
        })

    })

    //Utilizar arquivo de rotas do admin
    app.use('/admin', admin)

    //Utilizar arquivo de rotas para usuario
    app.use('/usuarios', usuarios)

//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})