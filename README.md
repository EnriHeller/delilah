# Delilah Resto - REST API

This project develops the backend for an online ordering system for a restaurant. It defines a REST API that allows creating, deleting, modifying, and retrieving information from a database that interrelates users (customers or administrators), dishes, and orders. The development aims for production deployment using web services.

## Prerequisites

To set up the project for local server startup, direct database access, and execution of HTTP endpoints, the following software is required:

- Node.js
- Git Bash
- XAMPP
- MySQL Workbench (version 8.0.26)

## Installation

To establish the database connection, start **XAMPP** and enable the MySQL module. Then, start **MySQL Workbench**, create a new connection with the following parameters:

```
Connection Name: XAMPP MYSQL
Connection Method: Standard (TCP/IP)
Hostname: 127.0.0.1
Port: 3306
Username: root
```

After confirming, press **OK** and enter the connection. Open the file *sqlScript.sql* and execute its statements. This will create the schema *proyecto-delilah-resto* (refresh the schema list to view it), where the tables for the data types will be stored.

To start the server locally, open the project folder in Git Bash terminal. Run `npm install` to install dependencies, then `npm run dev` to start the server and connect to the database.

If successful, you should see the following message in the console:

```
Servidor se ha iniciado en puerto 3000
Executing (default): SELECT 1+1 AS result
Conexion exitosa con la db
```

## Repository Structure

- **`server.js`**: Main server file.
- **`config/db.js`**: Database configuration.
- **`models/`**: Data models.
  - `index.js`: Model index.
  - `pedidos.js`: Orders model.
  - `pedidosHasPlatos.js`: Order-dish relationship.
  - `platos.js`: Dishes model.
  - `usuarios.js`: Users model.
- **`sqlScript.sql`**: Database schema script.
- **`spec.json`** and **`spec.yaml`**: OpenAPI specifications.
- **`delilah-resto.postman_collection`**: Postman collection for testing endpoints.
- **`.env`**: Environment variables (copy from `.env.example`).

## Technologies Used

- **Node.js**: Runtime environment.
- **Express.js**: Web framework for the API.
- **MySQL**: Database.
- **Sequelize**: ORM for database interactions.
- **JWT**: Authentication (assumed).
- **Postman**: API testing.
- **Swagger**: API documentation.

## Usage

- Use Postman to test endpoints via `delilah-resto.postman_collection`.
- View API docs in Swagger after starting the server.

## Notes

- For remote or different environments, modify variables in `.env`.
- All created users are non-admin by default. To make a user admin, run in MySQL Workbench:

  ```
  UPDATE `proyecto-delilah-resto`.`usuarios` SET `esAdmin` = '1' WHERE (`id` = '<user_id>');
  ```

- Ensure the server is running (`npm run dev`) to access Swagger docs.

## Author

- **Enrique Heller** - [EnriHeller](https://github.com/EnriHeller)

## License

This repository is for educational purposes. Use and modify freely, but cite the source.