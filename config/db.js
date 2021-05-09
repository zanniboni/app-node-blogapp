//Verifica se o enviroment do mongo está em produção e define a chave de conexão do mongo
if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}else{
    module.exports = {mongoURI: "mongodb://localhost/blogapp"}
}