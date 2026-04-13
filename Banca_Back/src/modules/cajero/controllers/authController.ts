import { Request, Response } from "express";
import pool from "../../../config/database";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class AuthController {
    async login(req: Request, res: Response): Promise<Response> {
        try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({
            mensaje: "Correo y contraseña son obligatorios"
            });
        }

        const [rows]: any = await pool.query(
            "SELECT id_usuario, nombre, correo, contrasena, activo FROM usuarios WHERE correo = ?",
            [correo]
        );

        if (rows.length === 0) {
            return res.status(400).json({
            mensaje: "Correo o contraseña incorrectos"
            });
        }

        const usuario = rows[0];

        if (usuario.activo === 0) {
            return res.status(403).json({
            mensaje: "Cuenta inhabilitada. Contacte al administrador."
            });
        }

        const claveValida = await bcrypt.compare(contrasena, usuario.contrasena);

        if (!claveValida) {
            return res.status(400).json({
            mensaje: "Correo o contraseña incorrectos"
            });
        }

        const token = jwt.sign(
            {
            id: usuario.id_usuario,
            correo: usuario.correo
            },
            process.env.JWT_SECRET as string,
            {
            expiresIn:
                process.env.JWT_EXPIRES as unknown as jwt.SignOptions['expiresIn'] ||
                "1h"
            }
        );

        return res.json({
            mensaje: "Inicio de sesión exitoso",
            token,
            usuario: {
            id: usuario.id_usuario,
            nombre: usuario.nombre,
            correo: usuario.correo
            }
        });
        } catch (error: any) {
        return res.status(500).json({
            error: error.message
        });
        }
    }
    }