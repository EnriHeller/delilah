const Sequelize = require("sequelize");

//XAMMP

//TODOS ESTOS DATOS PUEDEN CAMBIAR DE AMBIENTE, ESTAS SON VARIABLES DE ENTORNO/AMBIENTE. ESTO SE ARREGLA CON DOTENV
const {user,host,port,dbName} = process.env;

const conString = `mysql://${user}@${host}:${port}/${dbName}`;

const sequelizeObject = new Sequelize(conString, {
    operatorsAliases: false,
});

sequelizeObject
.authenticate()
.then(() => {
    console.log("Conexion exitosa con la db");
})
.catch((e) => {
    console.error(e.message);
});

module.exports = sequelizeObject;
