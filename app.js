//Carregando módulos
    const express = require('express') //Base do app
    const handlebars = require('express-handlebars') //Utilizar handlebars + express
    const app = express() // Definição do nosso app
    const admin = require('./routes/admin') //Rotas de administrador
    const path = require('path') 
    const mongoose = require('mongoose') //Banco de dados
    const session = require('express-session') //Usado para definir sessões do navegador
    const flash = require('connect-flash') //Mensagens de popup de erro e sucesso
    const moment = require('moment') //Gerenciar horas nas publicações
    require("./models/Postagem") //Model para postagem
    const Postagem = mongoose.model("postagens")
    require("./models/Categoria") // Model para categorias
    const Categoria = mongoose.model("categorias")
    const usuarios = require('./routes/usuario') //Model de usuários
    const passport = require("passport") //Autenticação 
    require("./config/auth")(passport) //Passar a definição do passport para o arquivo auth
    const db = require("./config/db") //Arquivo de gerenciamento do banco de dados

//Configurações
    // Configurar sessão
        app.use(session({
            secret: "blogapp",
            resave: true,
            saveUninitialized: true
        }))
        
    //Inicialização do passport e da session do passport
        app.use(passport.initialize())
        app.use(passport.session())
    
    //Definicação do flash para as mensagens
        app.use(flash())
    
    // Middleware
        //Definição de variáveis globais no app
        app.use((req, res, next) => {
            res.locals.success_msg = req.flash("success_msg")
            res.locals.error_msg = req.flash("error_msg")
            res.locals.error = req.flash("error")
            res.locals.user = req.user || null
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
        //mongoose.Promise = global.Promise
        mongoose.connect(db.mongoURI, db.serverConfig).then(() => {
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
            console.log(err)
            res.render("pages/error")
        })
        
    })

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })
    
    //Rota para homepage parallax
    app.get("/home", (req, res) => {
        res.render("pages/home")
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

    app.use((req, res, next) => {
        res.render("pages/error")
    });

//Outros
var PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log("Servidor rodando!")
})