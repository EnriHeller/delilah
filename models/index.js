const Pedidos = require("./pedidos");
const PedidosHasPlatos = require("./pedidosHasPlatos");
const Platos = require("./platos");
const Usuarios = require("./usuarios");

Usuarios.hasMany(Pedidos, {
    foreignKey: "usuarios_id",
});

Pedidos.belongsTo(Usuarios, {
    foreignKey: "usuarios_id",
});

Pedidos.belongsToMany(Platos, {
    through: PedidosHasPlatos,
});

module.exports = {
    Platos,
    PedidosHasPlatos,
    Pedidos,
    Usuarios,
};