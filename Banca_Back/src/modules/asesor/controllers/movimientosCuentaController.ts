import service from '../services/movimientosCuentaService';

class MovimientosController {
    async buscarCuenta(req: any, res: any) {
        try {

            const { numeroCuenta } = req.params;

            const data =
                await service.buscarCuenta(numeroCuenta);

            return res
                .status(200)
                .json(data);

        } catch (error: any) {

            return res
                .status(400)
                .json({
                    existe: false,
                    mensaje: error.message
                });

        }
    }
    
    async consultar(req: any, res: any) {
        console.log(
            'Entró a movimientos',
            req.params
        );
        try {
            const { numeroCuenta } = req.params;

            const data = await service.consultar(numeroCuenta);

            return res
                .status(200)
                .json(data);
        } catch {
            return res
                .status(500)
                .json({
                    mensaje:
                        'Error'
                });
        }
    }
}

export default new MovimientosController();