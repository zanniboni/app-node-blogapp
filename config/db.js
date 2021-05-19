//Verifica se o enviroment do mongo está em produção e define a chave de conexão do mongo
const production = true
if (production) {
    module.exports = {
        mongoURI: "mongodb+srv://zanniboni:StrongerUlisses002@blogapp.r9puk.mongodb.net/blogapp?retryWrites=true&w=majority",
        serverConfig: {
            useNewUrlParser: true,
            useUnifiedTopology: true, 
            useCreateIndex: true
        }
    }
} else {
    module.exports = {
        mongoURI: "mongodb://localhost/blogapp",
        serverConfig: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        }
    }
}