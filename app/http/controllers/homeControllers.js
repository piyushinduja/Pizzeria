const Menu = require('../../models/Menu')

function homeController(){
    return{
        index(req, res){
            Menu.find().then((pizzas)=>{
                return res.render('home', {pizzas:pizzas})
            })
        }
    }
}

module.exports = homeController