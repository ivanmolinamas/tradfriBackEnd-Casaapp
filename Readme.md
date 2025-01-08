# CASAAPP

Breve manual

#### no olvidar hacer el `npm install`

## Configuración básica con el tradfri de Ikea
Esta aplicación se conecta con el gateway de Ikea Tradfri. Para ello debemos tener uno en la red local y de ahí obtener las dos cosas:
- Dirección IP
- Codigo de seguridad (Esta debajo del dispositivo)

Esa información hay que añadirla al archivo .env en las variables correspondientes:
```json
GATEWAY_IP="192.168.1.34"
SECURITY_CODE="eB2hAeUwtpA95BCO"
```

Con esto el programa se conectara y tendrá acceso a la pasarela tradfri y podremos obtener y controlar los dispositivos.

## Configuración de la base de datos

Para el entorno de desarrollo, la base de datos esta configurada con docker-compose, por lo cual solo necesitaremos levantarlo.

```shell
docker-compose up -d
```
y para detenerlo

```shell
docker-compose down
```

La estructura de la base de datos es la siguiente:

El nombre de la base de datos es db1 y las tablas:
- usuarios
- usuarios_dispositivos
- dispositivos
- escenas

### Sentencias SQL para crear las tablas

Si se desea usar o crear una base de datos en un servidor, aqui estan las sentencias SQL para crear las tablas necesarias

#### tabla usuarios

``` sql
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') NOT NULL DEFAULT 'usuario',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
```
#### tabla dispositivos

``` sql
CREATE TABLE `dispositivos` (
  `ID_device` int(5) NOT NULL,
  `name_device` varchar(255) DEFAULT NULL,
  `type_device` tinyint(4) DEFAULT NULL CHECK (`type_device` between 0 and 4),
  `widget_type` enum('slider','switch','text','chart') DEFAULT NULL,
  PRIMARY KEY (`ID_device`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci

```
#### tabla escenas

``` sql
CREATE TABLE `escenas` (
  `id_scene` int(11) NOT NULL AUTO_INCREMENT,
  `name_scene` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  PRIMARY KEY (`id_scene`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci
```
#### tabla usuarios_dispositivos

``` sql
CREATE TABLE `usuario_dispositivos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `device_id` int(11) NOT NULL,
  `custom_name` varchar(255) DEFAULT NULL,
  `widget_type` enum('slider','switch','text','chart') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`device_id`),
  UNIQUE KEY `user_device_unique` (`user_id`,`device_id`),
  KEY `device_id` (`device_id`),
  CONSTRAINT `usuario_dispositivos_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `usuario_dispositivos_ibfk_2` FOREIGN KEY (`device_id`) REFERENCES `dispositivos` (`ID_device`)
) ENGINE=InnoDB AUTO_INCREMENT=65612 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci

```

## Levantar el servidor de desarrollo

Para levantar el servidor de desarrollo para practicas:

```shell
npm run dev 
```

## Usar programa en servidor

