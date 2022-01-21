//LIBRARIES
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const {estados} = require("./models/pedidos");

//MODELS
const {
    Pedidos,
    Platos,
    Usuarios,
    PedidosHasPlatos,
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
    if(userInDb){
        if(userInDb.correo == posibleUsuario.correo){
            res.status(401);
            res.json({error: "El correo electronico ingresado no se encuentra disponible"})
        }else if(userInDb.usuario == posibleUsuario.usuario){
            res.status(401);
            res.json({error: "El usuario ingresado no se encuentra disponible"})
        }else{
            next()
        }
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

//SIGN IN
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

//LOGIN
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

//OBTENER TODOS LOS PLATOS
server.get("/platos/", async(req,res)=>{
    const platos = await Platos.findAll({where: {active: true}});
    res.status(200).json(platos)
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

//NUEVO PLATO
server.post("/platos", adminValidation, async(req,res)=>{
    try {
        const {nombre, precio, imagen} = req.body;
        const nuevoPlato = await Platos.create({
            nombre,
            precio,
            imagen
        });
        res.status(201).json(nuevoPlato);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
})

//DESACTIVAR UN PLATO
server.delete("/platos/:id", async(req,res)=>{
    idPlato = req.params.id;
    try {
        await Platos.update({active: false}, {where:{id: idPlato}});
        const plato = await Platos.findOne({where: {id: idPlato}})
        res.status(200).json(plato)
    } catch (error) {
        res.status(400).json({error: error.message})
    }
});

//MODIFICAR UN PLATO
server.put("/platos/:id", async(req,res)=>{
    idPlato = req.params.id;
    const {nombre, precio, imagen} = req.body;
    try {
        await Platos.update({nombre, precio, imagen}, {where:{id: idPlato}});
        const plato = await Platos.findOne({where: {id: idPlato}});
        res.status(200).json(plato)
    } catch (error) {
        res.status(400).json({error: error.message})
    }

})

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

//OBTENER PEDIDOS DE USUARIO LOGEADO
server.get("/pedidosUsuario", async (req, res) => {
    try {
        const pedidosUser = await Pedidos.findAll({
            include: [
                { model: Usuarios, attributes: ["id", "nombre", "correo"] },
                { model: Platos },
            ],
            where: {usuarios_id: req.user.id},
        });
        res.status(200).json(pedidosUser);
    
    } catch (error) {
        res.status(400).json(error.message);
    }
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

//CREAR PEDIDO
server.post("/pedidos", async(req,res)=>{
    try {
    const {forma_pago, platos} = req.body;
    const dataPlatos = await Promise.all(
        platos.map(async (plato)=>{
        const platoDB = await Platos.findOne({
            where: {
                id: plato.platoId,
            }
        });

        return {
            cantidad: plato.cantidad,
            id: plato.platoId,
            precio: platoDB.precio,
        };
    }))

    const precio_total = dataPlatos.reduce((acc, dataPlato)=>{
        return (acc + dataPlato.precio * dataPlato.cantidad)
    }, 0); 


    const nuevoPedido = await Pedidos.create({
        precio_total,
        forma_pago,
        usuarios_id: req.user.id,
    });

    
await Promise.all(
    dataPlatos.map(async (plato) => {
    await PedidosHasPlatos.create(
        {
            cantidad: plato.cantidad,
            plato_id: plato.id,
            pedido_id: nuevoPedido.id,
        },
        {
            fields: ["cantidad", "plato_id", "pedido_id"],
        }
    );
}));

    res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(400).json({error: error.message})
    }
    
});

//CAMBIAR ESTADO DEL PEDIDO
server.put("/pedidos/:id/", adminValidation, async (req, res) => {
    const idPedido = req.params.id;
    nuevoEstado = estados.find((estado)=>{return estado == req.body.estado});
    try {
        if(nuevoEstado){
            await Pedidos.update({
                estado: nuevoEstado,
            },{
                where: {id: idPedido}
            })
        }else{
            throw new Error("El estado ingresado es invalido")
        }
        res.status(200).json(await Pedidos.findOne({where: {id: idPedido} }));
    } catch (error) {
        res.status(400).json(error.message);
    }
}) 

//ELIMINAR PEDIDO
server.delete("/pedidos/:id",adminValidation, async (req,res) =>{
    const idPedido = req.params.id;
    
    const posiblePedido = await Pedidos.findOne({
        where: {
            id:idPedido,
        }
    })

    if(!posiblePedido){
        res.status(404).json({
            error: `No existe pedido con id ${idPedido}`
        });
    }else{  

        await PedidosHasPlatos.destroy({
            where: {
                pedido_id: idPedido,
            }
        });

       await Pedidos.destroy({
            where: {
                id: idPedido,
            }
        }); 
    } 

    res.json("El pedido fue eliminado");
});

//ELIMINAR PEDIDO DE USUARIO LOGEADO
server.delete("/pedidosUsuario/:id", async (req,res) =>{
    const idPedido = req.params.id;
    
    const posiblePedido = await Pedidos.findOne({
        where: {
            id:idPedido,
            usuarios_id: req.user.id
        }
    })

    if(!posiblePedido || posiblePedido == null){
        res.status(400)
        res.json({
            error: `No existe pedido con id ${idPedido} que sea del usuario logeado`
        });
    }else{  

        await PedidosHasPlatos.destroy({
            where: {
                pedido_id: idPedido,
            }
        });

        await Pedidos.destroy({
            where: {
                id: idPedido,
            }
        }); 
    } 

    res.json("El pedido fue eliminado");
});


//SERVER PORT LISTENER
server.listen(PORT, () => {
    console.log(`Servidor se ha iniciado en puerto ${PORT}`);
});