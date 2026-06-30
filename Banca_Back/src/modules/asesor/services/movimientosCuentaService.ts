import pool from '../../../config/database';

class MovimientosCuentaService {
    async buscarCuenta(numeroCuenta: string) {

        const connection =
            await pool.getConnection();

        try {

            const [rows]: any =
                await connection.query(
                    `
                    SELECT
                        ca.numero_cuenta,
                        ca.estado_cuenta,
                        ca.id_cliente,

                        COALESCE(
                            CONCAT(
                                c.primer_nombre,
                                ' ',
                                IFNULL(c.segundo_nombre,''),
                                ' ',
                                c.primer_apellido,
                                ' ',
                                IFNULL(c.segundo_apellido,'')
                            ),
                            e.razon_social
                        ) titular,

                        COALESCE(
                            c.numero_documento,
                            e.nit
                        ) numeroDocumento,

                        CASE
                            WHEN ca.id_cliente IS NOT NULL
                            THEN 'Natural'
                            ELSE 'Juridica'
                        END tipoTitular

                    FROM cuentas_ahorro ca

                    LEFT JOIN clientes c
                        ON ca.id_cliente=c.id_cliente

                    LEFT JOIN info_empresas e
                        ON ca.id_empresa=e.id_info_empresas

                    WHERE ca.numero_cuenta=?
                    `,
                    [numeroCuenta]
                );

            if (!rows.length) {

                return {
                    existe: false,
                    mensaje: 'La cuenta no existe'
                };

            }

            return {
                existe: true,
                mensaje: `Cuenta ${rows[0].estado_cuenta.toLowerCase()} encontrada`,
                datos: rows[0]
            };

        } finally {

            connection.release();

        }

    }

    async consultar(numeroCuenta: string) {
        const connection = await pool.getConnection();

        try {
            const [rows]: any = await connection.query(
                `SELECT
                    t.tipo_transaccion,
                    t.monto,
                    t.saldo_anterior,
                    t.saldo_nuevo,
                    t.fecha_transaccion,

                    COALESCE(
                        CONCAT(
                            c.primer_nombre,' ',
                            IFNULL(c.segundo_nombre,''),' ',
                            c.primer_apellido,' ',
                            IFNULL(c.segundo_apellido,'')
                        ),
                        e.razon_social
                    ) titular,

                    COALESCE(
                        c.numero_documento,
                        e.nit
                    ) numeroDocumento

                FROM transacciones t

                INNER JOIN cuentas_ahorro ca
                ON ca.id_cuenta=t.id_cuenta

                LEFT JOIN clientes c
                ON c.id_cliente=ca.id_cliente

                LEFT JOIN info_empresas e
                ON e.id_info_empresas=ca.id_empresa

                WHERE ca.numero_cuenta=?

                ORDER BY t.fecha_transaccion DESC
                `, [numeroCuenta]);

            return {
                movimientos: rows.map((r: any) => ({
                    titular: r.titular,
                    numeroDocumento: r.numeroDocumento,
                    tipoTransaccion: r.tipo_transaccion,
                    monto: r.monto,
                    saldoAnterior: r.saldo_anterior,
                    saldoActual: r.saldo_nuevo,
                    fecha: r.fecha_transaccion
                }))
            };
        } catch (error) {
            console.error('Error en MovimientosCuentaService', error);
            throw new Error('Error al consultar los movimientos de la cuenta.');
        } finally {
            connection.release();
        }
    }
}

export default new MovimientosCuentaService();