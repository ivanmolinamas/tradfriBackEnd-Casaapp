-- Creación de la base de datos
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') NOT NULL DEFAULT 'usuario',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user` (`user`)
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `dispositivos` (
  `ID_device` int(5) NOT NULL,
  `name_device` varchar(255) DEFAULT NULL,
  `type_device` tinyint(4) DEFAULT NULL CHECK (`type_device` between 0 and 4),
  `widget_type` enum('slider','switch','text','chart') DEFAULT NULL,
  PRIMARY KEY (`ID_device`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

CREATE TABLE `escenas` (
  `id_scene` int(11) NOT NULL AUTO_INCREMENT,
  `name_scene` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`data`)),
  PRIMARY KEY (`id_scene`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=65612 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
