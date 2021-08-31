//LIBRARIES
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const db = require("./conexion");

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

const searchUserInDb = async (user) => {
    const arrayOfArrays = await db.query(`SELECT * FROM usuarios WHERE 
        usuario ='${user.usuario}' or email ='${user.email}';`);
        const arrayUserInDb = await arrayOfArrays[0];
        return arrayUserInDb[0]; 
}

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
        const userInDb = await searchUserInDb(posibleUsuario);
        if (
            posibleUsuario.usuario == null || posibleUsuario.usuario == "" ||
            posibleUsuario.nombre == null || posibleUsuario.nombre == "" ||
            posibleUsuario.email == null || posibleUsuario.email == "" ||
            posibleUsuario.contrasena == null || posibleUsuario.contrasena == "" ||
            posibleUsuario.direccion == null || posibleUsuario.direccion == "" ||
            posibleUsuario.telefono == null || posibleUsuario.telefono == "" 
        ){
            res.status(400).json({error: `Debe completar todos los campos. Inténtelo nuevamente.`});
        } else if (userInDb) {
            res.status(400).json(userInDb); 
        }else{
            next();
        }
    } catch (error) {
        console.log(error.message);
    }
}



//LIMIT POLITICS: login
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: "Excediste el numero de peticiones intenta mas tarde",
});

////GlOBAL MIDDLEWARES
server.use(express.json());
/* server.use(logger); */
server.use(cors());
server.use(helmet());
server.use(compression());

///////////* MIDDLEWARE QUE VALIDE SI HAY UN TOKEN QUE TENGA LOS DATOS DEL USUARIO QUE HIZO EL LOGIN. (todos los endpoints menos login y sign) *////////////

////CONSTANTS
const PORT = 3000;
const JWT_SECRET = "834e9t8-34GGrSs48(#7RFHYGF-874j761!78-gjhgasfifkgYGU-kuyhgKHG";

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
    const nombre = req.body.nombre;
    const email = req.body.email;
    const contrasena = req.body.contrasena;
    const direccion = req.body.direccion;
    const telefono = req.body.telefono;

    try{
        const newUser = await db.query(`INSERT INTO usuarios(usuario, nombre, email, contrasena, direccion, telefono, isAdmin)
        VALUES ("${usuario}", "${nombre}", "${email}", "${contrasena}", "${direccion}", ${telefono}, false);`, {type: db.QueryTypes.INSERT});
        res.status(200);
        res.json("Se ha registrado correctamente.");
    }catch(error){
        console.error(error.message);
    }
})




//SERVER PORT LISTENER
server.listen(PORT, () => {
    console.log(`Servidor se ha iniciado en puerto ${PORT}`);
});