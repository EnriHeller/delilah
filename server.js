//LIBRARIES
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const db = require("./config/db");
const Usuarios = require("./models/usuarios");

////CONSTANTS
const PORT = 3000;
const JWT_SECRET = "834e9t8-34GGrSs48(#7RFHYGF-874j761!78-gjhgasfifkgYGU-kuyhgKHG";

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
        email,
        contrasena,
        direccion,
        telefono,
    } = req.body;
    
    try {
        const arrayOfArrays = await db.query(`SELECT * FROM usuarios WHERE 
        usuario ='${posibleUsuario.usuario}' or email ='${posibleUsuario.email}';`);
        const arrayUserInDb = await arrayOfArrays[0];
        if (
            posibleUsuario.usuario == null || posibleUsuario.usuario == "" ||
            posibleUsuario.nombre == null || posibleUsuario.nombre == "" ||
            posibleUsuario.email == null || posibleUsuario.email == "" ||
            posibleUsuario.contrasena == null || posibleUsuario.contrasena == "" ||
            posibleUsuario.direccion == null || posibleUsuario.direccion == "" ||
            posibleUsuario.telefono == null || posibleUsuario.telefono == "" 
        ){
            res.status(400);
            throw new Error(`Debe completar todos los campos. Inténtelo nuevamente.`)
        } else if (arrayUserInDb[0]) {
            res.status(400);
            throw new Error("El usuario o email ingresado no está disponible. Intente nuevamente.");
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
/* server.use(logger); */
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
///////////* MIDDLEWARE QUE VALIDE SI HAY UN TOKEN QUE TENGA LOS DATOS DEL USUARIO QUE HIZO EL LOGIN. (todos los endpoints menos login y sign) *////


////ENDPOINTS

//OBTENER TODOS LOS USUARIOS ///////////////(VALIDAR admin)///////////////////
server.get("/usuarios", async (req, res) => {
    const usuarios = await db.query("SELECT * FROM usuarios", {
    type: db.QueryTypes.SELECT,
    });
    res.json(usuarios);
    console.log("hola desde ruta /usuarios ");
    res.status(200);
});

server.post("/signIn",signInValidation, async (req, res)=>{
    const usuario = req.body.usuario;
    const email = req.body.email;
    const nombre = req.body.nombre;
    const contrasena = req.body.contrasena;
    const direccion = req.body.direccion;
    const telefono = req.body.telefono;

    try{
        const newUser = await db.query(`INSERT INTO usuarios(usuario, nombre, email, contrasena, direccion, telefono, isAdmin)
        VALUES ("${usuario}", "${nombre}", "${email}", "${contrasena}", "${direccion}", ${telefono}, false);`, {type: db.QueryTypes.INSERT});
        res.status(200);
        res.json("Se ha registrado correctamente.");
    }catch(error){
        res.status(400);
        res.json(error.message);
    }
});

server.post("/logIn",limiter, async(req, res) =>{
    const email = req.body.email;
    const contrasena = req.body.contrasena;
    try {
        const arrayUserInDb = await db.query(`SELECT * FROM usuarios WHERE email = '${email}' and contrasena = '${contrasena}';`, {type: db.QueryTypes.SELECT});

        const userInDb = await arrayUserInDb[0];

        if(userInDb){
            const token = jwt.sign(
                {
                    id: userInDb.id,
                    usuario: userInDb.usuario,
                },
                JWT_SECRET,
                {expiresIn: "24h"}
            );

            res.status(200);
            res.json(token);
        }else{
            res.status(401);
            res.json("Email o contraseña invalidos. Intente nuevamente");
        }
    } catch (error) {
        res.status(400);
        res.json(error.message);
    }
})


//SERVER PORT LISTENER
server.listen(PORT, () => {
    console.log(`Servidor se ha iniciado en puerto ${PORT}`);
});