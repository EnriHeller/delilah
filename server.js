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

//Repensar 
const signInValidation = async (req, res, next) => {
    const posibleUsuario = {
        usuario,
        nombre,
        correo,
        contrasena,
        direccion,
        telefono,
    } = req.body;
    
    try {
        const arrayOfArrays = await db.query(`SELECT * FROM usuarios WHERE 
        usuario ='${posibleUsuario.usuario}' or correo ='${posibleUsuario.correo}';`);
        const arrayUserInDb = await arrayOfArrays[0];
        if (
            posibleUsuario.usuario == null || posibleUsuario.usuario == "" ||
            posibleUsuario.nombre == null || posibleUsuario.nombre == "" ||
            posibleUsuario.correo == null || posibleUsuario.correo == "" ||
            posibleUsuario.contrasena == null || posibleUsuario.contrasena == "" ||
            posibleUsuario.direccion == null || posibleUsuario.direccion == "" ||
            posibleUsuario.telefono == null || posibleUsuario.telefono == "" 
        ){
            res.status(400);
            throw new Error(`Debe completar todos los campos. Inténtelo nuevamente.`)
        } else if (arrayUserInDb[0]) {
            res.status(400);
            throw new Error("El usuario o correo ingresado no está disponible. Intente nuevamente.");
            /* res.status(400).json(arrayOfArrays); */
        }else{
            next();
        }
    } catch (error) {
        res.json(error.message);
    }
}

//LIMIT POLITICS: login
const limiter = rateLimit({
    windowMs: 60 * 1000, //60 segundos
    max: 5,
    message: "Excediste el numero de peticiones intenta mas tarde",
});

////GlOBAL MIDDLEWARES
server.use(express.json());
server.use(logger); 
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

server.post("/signIn", async (req, res)=>{
    
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

server.post("/logIn",limiter, async(req, res) =>{
    const {posibleCorreo, posibleContrasena} = req.body;

    try {
        const posibleUsuario = await Usuarios.findOne({
            attributes: ["correo", "contrasena", "id", "usuario"],
            where: {correo: posibleCorreo, contrasena: posibleContrasena}
        });

        if(posibleUsuario){
            const token = jwt.sign(
                {id: posibleUsuario.id, usuario: posibleUsuario.usuario,},
                JWT_SECRET,
                {expiresIn: "24h"}
            );
            res.status(200);
            res.json(token);
        }else{
            res.status(401);
            res.json("correo o contraseña invalidos. Intente nuevamente");
        }
    } catch (error) {
        res.status(400);
        res.json(error.message);
    }
})

//OBTENER USUARIOS
server.get("/usuarios", async (req, res) => {
    const usuarios = await Usuarios.findAll()
    res.json(usuarios);
    res.status(200);
});


//OBTENER PLATOS POR ID
server.get("/platos/:id", async(req,res)=>{
    const idParam = req.params.id;
    const plato =  await Platos.findOne({
        attributes: ["id", "imagen", "nombre", "precio"],
        where: {active:true, id: idParam}
    });
    plato ? res.json(plato):res.status(400).json({error:`No existe el plato con el id ${idParam}`});
});

//OBTENER PEDIDOS
server.get("/pedidos", async (req, res) => {
  const pedidos = await Pedidos.findAll({
    include: [
      { model: Usuarios, attributes: ["id", "nombre", "correo"] },
      { model: Platos },
    ],
  });
  res.json(pedidos);
});

//SERVER PORT LISTENER
server.listen(PORT, () => {
    console.log(`Servidor se ha iniciado en puerto ${PORT}`);
});