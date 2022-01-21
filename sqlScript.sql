-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema proyecto-delilah-resto
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema proyecto-delilah-resto
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `proyecto-delilah-resto` DEFAULT CHARACTER SET utf8 ;
-- -----------------------------------------------------
-- Schema proyecto-delilah-resto
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema proyecto-delilah-resto
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `proyecto-delilah-resto` DEFAULT CHARACTER SET utf8 ;
USE `proyecto-delilah-resto` ;

-- -----------------------------------------------------
-- Table `proyecto-delilah-resto`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proyecto-delilah-resto`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(300) NOT NULL,
  `usuario` VARCHAR(100) NOT NULL,
  `correo` VARCHAR(150) NOT NULL,
  `telefono` VARCHAR(45) NOT NULL,
  `direccion` VARCHAR(450) NOT NULL,
  `contrasena` VARCHAR(45) NOT NULL,
  `esAdmin` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `correo_UNIQUE` (`correo` ASC))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `proyecto-delilah-resto`.`platos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proyecto-delilah-resto`.`platos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL,
  `precio` FLOAT NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `imagen` VARCHAR(1024) NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `proyecto-delilah-resto`.`pedidos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proyecto-delilah-resto`.`pedidos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `precio_total` FLOAT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  `estado` ENUM('NUEVO', 'CONFIRMADO', 'PREPARANDO', 'ENVIANDO', 'CANCELADO', 'ENTREGANDO') NOT NULL DEFAULT 'NUEVO',
  `forma_pago` ENUM('EF', 'TC', 'MP') NOT NULL,
  `usuarios_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_pedidos_usuarios_idx` (`usuarios_id` ASC),
  CONSTRAINT `fk_pedidos_usuarios`
    FOREIGN KEY (`usuarios_id`)
    REFERENCES `proyecto-delilah-resto`.`usuarios` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `proyecto-delilah-resto`.`pedidos_has_platos`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `proyecto-delilah-resto`.`pedidos_has_platos` (
  `pedido_id` INT NOT NULL,
  `plato_id` INT NOT NULL,
  `cantidad` INT NOT NULL,
  PRIMARY KEY (`pedido_id`, `plato_id`),
  INDEX `fk_pedidos_has_platos_platos1_idx` (`plato_id` ASC),
  INDEX `fk_pedidos_has_platos_pedidos1_idx` (`pedido_id` ASC),
  CONSTRAINT `fk_pedidos_has_platos_pedidos1`
    FOREIGN KEY (`pedido_id`)
    REFERENCES `proyecto-delilah-resto`.`pedidos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_pedidos_has_platos_platos1`
    FOREIGN KEY (`plato_id`)
    REFERENCES `proyecto-delilah-resto`.`platos` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

USE `proyecto-delilah-resto` ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;