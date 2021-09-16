//LIBRARIES
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");

//MODELS
const {
    Pedidos,
    Platos,
    Usuarios,
    pedidosHasPlatos,
} = require("./models/index");

////CONSTANTS
const PORT = process.env.SERVER_PORT;
const JWT_SECRET = process.env.JWT_SECRET;

//INSTANCES
const server = express();

////MIDDLEWARES DEFINITIONS
const logger = (req, res, next) => {
    const path = req.path;
    const method = req.method;
    const body = req.body;
    const params = req.params;
    console.log(req);
    console.log(` 
    ${method} -
    ${path} -
    ${JSON.stringify(body)} -
    ${JSON.stringify(params)}`); 
    next();
}; 

const signInValidation = async (req, res, next) => {
    const posibleUsuario = {
        usuario,
        nombre,
        correo,
        contrasena,
        direccion,
        telefono,
    } = req.body;
    
    const userInDb = await Usuarios.findOne({
        attributes: ["usuario", "correo"],
        $or: [{usuario: posibleUsuario.usuario},{correo: posibleUsuario.correo}]
    })

    if(userInDb.correo == posibleUsuario.correo){
        res.status(401);
        res.json({error: "El correo electronico ingresado no se encuentra disponible"})
    }else if(userInDb.usuario == posibleUsuario.usuario){
        res.status(401);
        res.json({error: "El usuario ingresado no se encuentra disponible"})
    }else{
        next()
    }
}

const adminValidation = async (req, res, next)=>{
    try {
        const comprobation = await Usuarios.findOne({
            where: {id: req.user.id, esAdmin: true}
        });
    
        if(comprobation){
            next();
        }else{
            res.status(401);
            res.json({error: "Acceso denegado"});
        }
        
    } catch (error) {
        res.status(500).json({error: "Error, intentelo de nuevo más tarde"});
    }
}

const limiter = rateLimit({
    windowMs: 60 * 1000, //60 segundos
    max: 5,
    message: "Excediste el numero de peticiones intenta mas tarde",
});

////GlOBAL MIDDLEWARES
server.use(express.json());
/* server.use(logger);  */
server.use(cors());
server.use(helmet());
server.use(compression());

server.use(
    expressJwt({
        secret: JWT_SECRET,
        algorithms: ["HS256"],
    }).unless({
        path: ["/logIn", "/signIn"],
    })
);  

////ENDPOINTS

server.post("/signIn",signInValidation, async (req, res)=>{
    const newUser = {nombre, usuario, correo, telefono, direccion, contrasena} = req.body;
    
    Usuarios.create(newUser)
    .then(()=>{
        res.status(200);
        res.json(`Usuario ${newUser.usuario} creado`)
    })
    .catch((error=>{
        res.status(400);
            res.json(error.message);
        }));
});

//CREAR PEDIDO
server.post("/pedido", async(req,res)=>{
    const nuevoPedido = {platoId, cantidad} = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, JWT_SECRET);
});

server.post("/logIn",limiter, async(req, res) =>{
    const {posibleCorreo, posibleContrasena} = req.body;

    try {
        const posibleUsuario = await Usuarios.findOne({
            where: {correo: posibleCorreo, contrasena: posibleContrasena}
        });

        if(posibleUsuario){
            const token = jwt.sign(
                {id: posibleUsuario.id},
                JWT_SECRET,
                {expiresIn: "24h"}
            );
            res.status(200).json(token);
        }else{
            res.status(401).json("correo o contraseña invalidos. Intente nuevamente");
        }
    } catch (error) {
        res.status(500);
        res.json(error.message);
    }
})

//OBTENER TODOS LOS USUARIOS
server.get("/usuarios",adminValidation, async (req, res) => {
    const usuarios = await Usuarios.findAll()
    res.json(usuarios);
    res.status(200);
});

//OBTENER PLATO POR ID
server.get("/platos/:id", async(req,res)=>{
    const idParam = req.params.id;
    const plato =  await Platos.findOne({
        attributes: ["id", "imagen", "nombre", "precio"],
        where: {active:true, id: idParam}
    });
    plato ? res.json(plato):res.status(400).json({error:`No existe el plato con el id ${idParam}`});
});

//OBTENER TODOS LOS PEDIDOS
server.get("/pedidos", adminValidation, async (req, res) => {
    const pedidos = await Pedidos.findAll({
    include: [
        { model: Usuarios, attributes: ["id", "nombre", "correo", "telefono", "direccion"] },
        { model: Platos },
    ],
    });
    res.json(pedidos);
});

//OBTENER PEDIDO POR ID
server.get("/pedidos/:id", adminValidation, async (req, res) => {
    idParam = req.params.id;
    const pedido = await Pedidos.findOne({
    include: [
        { model: Usuarios, attributes: ["id", "nombre", "correo", "telefono", "direccion"] },
        { model: Platos },
    ],
    where: {id: idParam}
    });
    pedido ? res.json(pedido):res.status(400).json({error:`No existe el pedido con el id ${idParam}`});
});





/* 
//CAMBIAR ESTADO DEL PEDIDO
server.put("/estadopedido/:idPedido/:estado", adminValidation, async (req, res) => {
    const idPedido = req.params.id;
    const nuevoEstado = req.params.estado;
    try {
        const pedido = await Pedidos.findOne({
            where: {id: idPedido}
        });
        if(pedido){
            res.status(200).json(pedido);
        }else{
            throw new Error("No existe un pedido con el ID especificado")
        }
    } catch (error) {
        res.status(400).json(error.message);
    }
}) */


//SERVER PORT LISTENER
server.listen(PORT, () => {
    console.log(`Servidor se ha iniciado en puerto ${PORT}`);
});