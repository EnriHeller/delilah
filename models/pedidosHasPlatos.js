const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Pedidos = require ("./pedidos.js");
const Platos = require ("./platos.js");

const PedidosHasPlatos = sequelize.define("pedidos_has_platos", {
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull:false,
    },

    pedidos_id : {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: `pedidos_id`,
        references:{
            model: Pedidos,
            key: "id",
        },
    },
    platos_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "platos_id",
        references: {
            model: Platos,
            key: "id",
        },
    },
},
{
    tableName: "pedidos_has_platos",
    underscored: true,
    timestamps: false,
}
);

/* sequelize 
.sync({ force: true })
.then(function(err) {
    console.log('It worked!');
  }, function (err) { 
         console.log('An error occurred while creating the table:', err);
  }); */

module.exports = PedidosHasPlatos;