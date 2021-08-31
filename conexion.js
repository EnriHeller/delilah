const Sequelize = require("sequelize");

//XAMMP

const user = "root";
const host = "localhost";
const port = "3306";
const dbName = "delilahresto";

const conString = `mysql://${user}@${host}:${port}/${dbName}`;

const sequelizeObject = new Sequelize(conString);

sequelizeObject
.authenticate()
.then(() => {
    console.log("Conexion exitosa con la db");
})
.catch((e) => {
    console.error(e.message);
});

module.exports = sequelizeObject;
