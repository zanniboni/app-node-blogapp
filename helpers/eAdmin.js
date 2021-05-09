//Middle para controlar acessos a rotas
//Recebe as informações da sessão de usuário
module.exports= {
     eAdmin: function(req, res, next){
        //Verifica se o usuário está logado e se ele é admin
         if(req.isAuthenticated() && req.user.isAdmin == 1){
            //Libera a rota caso o usuário esteja logado e seja adminitrador
             return next()
         }
        
         //Caso o usuário não esteja logado ou não seja adminitrador, irá aparecer uma mensagem de erro
         req.flash("error_msg", "É preciso logar para acessar essa página.")
         res.redirect("/")

     }
 }