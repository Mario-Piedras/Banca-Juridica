import pool from "../../../config/database";

export class CrudController {

    async obtenerTodos(tabla: string) {
        const [rows] = await pool.query("SELECT * FROM ??", [tabla]);
        return rows;
    }

    async obtenerUno(tabla: string, ids: Record<string, any>) {
        const keys = Object.keys(ids);
        if (keys.length === 0) {
            throw new Error("Identificador requerido para obtener un registro");
        }

        const where = keys.map(k => `\`${k}\` = ?`).join(" AND ");
        const values = Object.values(ids);

        const [rows]: any = await pool.query(
            `SELECT * FROM ?? WHERE ${where} LIMIT 1`,
            [tabla, ...values]
        );

        return rows[0] || null;
    }

    async crear(tabla: string, data: Record<string, any>) {
        const [result]: any = await pool.query(
            "INSERT INTO ?? SET ?",
            [tabla, data]
        );

        return { id: result.insertId, ...data };
    }

    async actualizar(tabla: string, ids: Record<string, any>, data: Record<string, any>) {
        const keys = Object.keys(ids);
        if (keys.length === 0) {
            throw new Error("Identificador requerido para actualizar");
        }

        const where = keys.map(k => `\`${k}\` = ?`).join(" AND ");

        await pool.query(
            `UPDATE ?? SET ? WHERE ${where}`,
            [tabla, data, ...Object.values(ids)]
        );

        return this.obtenerUno(tabla, ids);
    }

    async eliminar(tabla: string, ids: Record<string, any>) {
        const keys = Object.keys(ids);
        if (keys.length === 0) {
            throw new Error("Identificador requerido para eliminar");
        }

        const where = keys.map(k => `\`${k}\` = ?`).join(" AND ");

        await pool.query(
            `DELETE FROM ?? WHERE ${where}`,
            [tabla, ...Object.values(ids)]
        );

        return { message: "Eliminado correctamente" };
    }
}