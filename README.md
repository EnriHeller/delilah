# Delilah Resto -  REST API

En este proyecto, se desarrolló el backend necesario para un sistema 
de pedidos online de un restaurante. 
En el se encuentra definida una REST API la cual permite realizar 
altas, bajas, modificaciones y obtención de información a una
base de datos que interrelaciona usuarios 
(clientes o administradores), platos y pedidos. 
El desarrollo del mismo parte del objetivo de que sea posible una puesta 
en producción utilizando web services.   

---
## Prerequisitos
---
Para un montaje del proyecto en el que se permita levantar
el servidor a nivel local, se tenga acceso directo a la base 
de datos y sea posible la ejecución de los correspondientes 
endpoints para interactuar sobre la misma mediante peticiones HTPP, 
se deberá contar con los siguientes softwares:

* Node JS
* Git Bash
* Xampp
* MySQL Workbench (versión 8.0.26)

---
## Instalación
---

Para establecer la conexión a la base de datos, inicializar **Xampp** y encender el módulo de MySQL.
Luego, inicializar **MySQL Workbench**, establecer una 
nueva conexión y disponer los siguientes parámetros:

```
Connection Name: XAMPP MYSQL
Connextion Method: Standard (TCP/IP)
Hostname: 127.0.0.1
Port: 3306
Username: root 
```
Habiendolos confirmado, presionar **OK** e ingresar a la conexión dispuesta.
Una vez echo esto, abrir el archivo *sqlScript.sql* y ejecutar sus 
sentencias. Se creará el schema 
*proyecto-delilah-resto* (para su visualización, se deberá actualizar la lista de schemas). 
donde se alojarán las tablas correspondientes
a los tipos de datos con los que se va a interactuar.

Para levantar el servidor a nivel de local, será necesario abrir la carpeta
del proyecto en la terminal de Git Bash. Luego, se deberá ejecutar `npm install` 
para instalar las dependencias necesarias, finalmente ejecutar `npm run dev`
para levantar el servidor y conectarlo a la base de datos.


Si los pasos se realizaron correctamente,
se debería visualizar el siguiente mensaje por consola:

```
Servidor se ha iniciado en puerto 3000
Executing (default): SELECT 1+1 AS result
Conexion exitosa con la db
```

---
## Observaciones
---

* En el caso que se desee correr el servidor en un entorno remoto o
distinto al definido localmente en este proyecto, en el archivo *.env* se definen las variables de entorno, las cuales pueden modificarse
sin inconvenientes. Tener en cuenta que también se deberá establecer la conexión en MySQL Workbench.

* Por seguridad, todos los usuarios creados serán no administradores. 
Para que un usuario sea administrador, ejecutar la siguiente sentencia
en MySQL Workbench, alojando el ID de dicho usuario:

```
UPDATE `proyecto-delilah-resto`.`usuarios` SET `esAdmin` = '1' WHERE (`id` = '<id_del_usuario>');

-- ---------------------------------------------------------------------
-- Ejemplo si el ID es 1:
-- UPDATE `proyecto-delilah-resto`.`usuarios` SET `esAdmin` = '1' WHERE (`id` = '1');
```

* Se incluye el archivo *delilah-resto.postman_collection* para
ser abierto mediante el software **Postman** y ejecutar las
peticiones HTPP sin necesidad de tener un entorno desarrollado para ello.

* Para visualizar los endpoints de *spec.yaml* y *spec.json* desde Swagger Editor, es necesario 
 haber levantado el servidor con el comando `npm run dev`