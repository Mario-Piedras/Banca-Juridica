export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  contrasena: string;
  fecha_creacion: Date;
  activo: boolean;
}

export interface RegistroUsuarioRequest {
  nombre: string;
  correo: string;
  contrasena: string;
  rol?: string;
}

export interface UsuarioResponse {
  id_usuario: number;
  nombre: string;
  correo: string;
  fecha_creacion: Date;
  activo: boolean;
}

export interface RegistroResponse {
  success: boolean;
  message: string;
  data?: UsuarioResponse;
}

export interface ValidacionEmailResponse {
  exists: boolean;
}

export interface LoginRequest {
  correo: string;
  contrasena: string;
  rol: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id_usuario: number;
    correo: string;
    nombre: string;
    rol: string;
    id_usuario_rol?: number;
    id_caja?: number;           // ← NUEVO: Para cajeros
    nombre_caja?: string;       // ← NUEVO: Para cajeros
  };
}

export interface Rol {
  id_rol: number;
  nombre: string;
  descripcion?: string;
}

export interface UsuarioConRoles {
  id_usuario: number;
  nombre: string;
  correo: string;
  activo: boolean;
  fecha_creacion: Date;
  roles: Rol[];
}

export interface AsignarRolRequest {
  correo: string;
  rol: string;
}

export interface AsignarRolResponse {
  success: boolean;
  message: string;
}

export interface VerificarRolRequest {
  correo: string;
  rol: string;
}

export interface VerificarRolResponse {
  success: boolean;
  tieneRol: boolean;
}

export interface AuthUser {
  id_usuario: number;
  correo: string;
  rol: string;
  id_usuario_rol: number;
  id_caja?: number;            // ← NUEVO: Para cajeros
  nombre_caja?: string;        // ← NUEVO: Para cajeros
}

// ========== INTERFACES COMPLETAS PARA CLIENTE ==========

export interface ClienteCompleto {
  // Datos personales
  tipoDocumento: string;
  numeroDocumento: string;
  lugarExpedicion?: string;
  ciudadNacimiento?: string;
  fechaNacimiento: string;
  fechaExpedicion?: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  genero: string;
  nacionalidad: string;
  otraNacionalidad?: string;
  estadoCivil: string;
  grupoEtnico: string;
  
  // Secciones
  contacto?: ContactoPersonal;
  actividad?: ActividadEconomica;
  laboral?: InformacionLaboral;
  financiera?: InformacionFinanciera;
  facta?: FactaCrs;
}

export interface ContactoPersonal {
  direccion?: string;
  barrio?: string;
  departamento?: string;
  telefono?: string;
  ciudad?: string;
  pais?: string;
  correo?: string;
  bloqueTorre?: string;
  aptoCasa?: string;
}

export interface ActividadEconomica {
  profesion?: string;
  ocupacion?: string;
  codigoCiiu?: string;
  detalleActividad?: string;
  numeroEmpleados?: number;
  factaCrs: boolean;
}

export interface InformacionLaboral {
  nombreEmpresa?: string;
  direccionEmpresa?: string;
  paisEmpresa?: string;
  departamentoEmpresa?: string;
  ciudadEmpresa?: string;
  telefonoEmpresa?: string;
  ext?: string;
  celularEmpresa?: string;
  correoLaboral?: string;
}

export interface InformacionFinanciera {
  ingresosMensuales?: number;
  egresosMensuales?: number;
  totalActivos?: number;
  totalPasivos?: number;
}

export interface FactaCrs {
  esResidenteExtranjero: boolean;
  pais?: string;
}

// Respuestas de la API
export interface ObtenerClienteResponse {
  success: boolean;
  data?: ClienteCompleto;
  message?: string;
}

export interface ActualizarClienteResponse {
  success: boolean;
  message: string;
  idCliente?: number;
}

// ========== INTERFACES PARA REGISTRAR CLIENTE ==========

export interface RegistrarClienteRequest {
  tipo_documento: string;
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  genero: string;
  fecha_nacimiento: string;
  estado_civil: string;
  profesion?: string;
  ocupacion?: string;
}

export interface RegistrarClienteResponse {
  exito: boolean;
  mensaje: string;
  id_cliente?: number;
}

// ===== INTERFACES PARA EL MÓDULO DE SOLICITUDES =====

export interface Cliente {
  id_cliente: number;
  numero_documento: string;
  tipo_documento: 'CC' | 'TI' | 'R.Civil' | 'PPT' | 'Pasaporte' | 'Carne diplomático' | 'Cédula de extranjería';
  lugar_expedicion?: string;
  ciudad_nacimiento?: string;
  fecha_nacimiento: Date;
  fecha_expedicion?: Date;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  genero: 'M' | 'F';
  nacionalidad: 'Colombiano' | 'Estadounidense' | 'Otra';
  otra_nacionalidad?: string;
  estado_civil: 'Soltero' | 'Casado' | 'Unión Libre';
  grupo_etnico: 'Indígena' | 'Gitano' | 'Raizal' | 'Palenquero' | 'Afrocolombiano' | 'Ninguna';
  fecha_registro?: Date;
}

export interface SolicitudApertura {
  id_solicitud?: number;
  id_cliente: number;
  id_usuario_rol: number;
  tipo_cuenta: 'Ahorros';
  estado?: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  comentario_director?: string;
  comentario_asesor?: string;
  archivo?: Buffer;
  fecha_solicitud?: Date;
  fecha_respuesta?: Date;
}

export interface SolicitudRequest {
  cedula: string;
  producto: string;
  comentario?: string;
}

export interface ClienteResponse {
  id_cliente: number;
  numero_documento: string;
  tipo_documento: string;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  nombre_completo: string;
}

export interface SolicitudResponse {
  id_solicitud: number;
  id_cliente: number;
  id_usuario_rol?: number;
  tipo_cuenta: string;
  estado: string;
  comentario_asesor?: string;
  fecha_solicitud: Date;
  cliente?: ClienteResponse;
  creado_por?: {
    nombre: string;
    email: string;
    rol: string;
  };
}

// ========================================
// INTERFACES DE CUENTAS Y TRANSACCIONES
// ========================================

export interface CuentaAhorro {
  id_cuenta?: number;
  numero_cuenta: string;
  id_cliente: number;
  id_solicitud?: number;
  saldo: number;
  estado_cuenta: string;
  fecha_apertura?: Date;
}

export interface Transaccion {
  id_transaccion?: number;
  id_cuenta: number;
  tipo_transaccion: string;
  tipo_deposito?: string;
  monto: number;
  codigo_cheque?: string;
  numero_cheque?: string;
  saldo_anterior: number;
  saldo_nuevo: number;
  cajero?: string;
  motivo_cancelacion?: string;
  fecha_transaccion?: Date;
}

// ========================================
// INTERFACES DEL MÓDULO CAJERO
// ========================================

export interface VerificarClienteRequest {
  tipoDocumento: string;
  numeroDocumento: string;
}

export interface VerificarClienteResponse {
  existe: boolean;
  estado: string;
  mensaje: string;
  icono?: string;
  nombreCompleto?: string;
  idCliente?: number;
  idSolicitud?: number;
}

export interface AperturarCuentaRequest {
  idSolicitud: number;
  tipoDeposito: string;
  valorDeposito: number;
  codigoCheque?: string;
  numeroCheque?: string;
  idUsuario?: number;    // ← NUEVO: id_usuario del cajero
  idCaja?: number;      // ← NUEVO: id_caja asignada
}

export interface AperturarCuentaResponse {
  exito: boolean;
  mensaje: string;
  numeroCuenta?: string;
  idCuenta?: number;
  idTransaccion?: number;
}

export interface BuscarCuentaRequest {
  numeroCuenta: string;
}

export interface BuscarCuentaResponse {
  existe: boolean;
  mensaje: string;
  datos?: {
    numeroCuenta: string;
    numeroDocumento: string;
    titular: string;
    saldo: number;
    estadoCuenta: string;
    idCuenta: number;
    idCliente: number;
  };
}

export interface ProcesarRetiroRequest {
  idCuenta: number;
  numeroDocumento: string;
  montoRetirar: number;
  idUsuario?: number;      // ← NUEVO
  idCaja?: number;         // ← NUEVO  
  nombreCaja?: string;     // ← NUEVO
}

export interface ProcesarRetiroResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    saldoAnterior: number;
    saldoNuevo: number;
    montoRetirado: number;
    fechaTransaccion: Date;
  };
}

export interface AplicarNotaDebitoRequest {
  idCuenta: number;
  numeroDocumento: string;
  valor: number;
  cajero?: string; 
  idUsuario?: number;      // ← NUEVO
  idCaja?: number;         // ← NUEVO  
  nombreCaja?: string;     // ← NUEVO
}

export interface AplicarNotaDebitoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    saldoAnterior: number;
    saldoNuevo: number;
    valor: number;
    fechaTransaccion: Date;
  };
}

export interface ProcesarConsignacionRequest {
  numeroCuenta: string;
  tipoConsignacion: 'Efectivo' | 'Cheque';
  valor: number;
  codigoCheque?: string;
  numeroCheque?: string;
  cajero?: string;
  idUsuario?: number;    // ← AGREGADO
  idCaja?: number;      // ← AGREGADO
}

export interface ProcesarConsignacionResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTransaccion: number;
    numeroCuenta: string;
    titular: string;
    numeroDocumento: string;
    saldoAnterior: number;
    saldoNuevo: number;
    valorConsignado: number;
    tipoConsignacion: string;
    codigoCheque?: string;
    numeroCheque?: string;
    fechaTransaccion: Date;
  };
}

export interface CancelarCuentaRequest {
  numeroCuenta: string;
  numeroDocumento: string;
  motivoCancelacion: string;
  idUsuario?: number;      // ← CORREGIDO: id_usuario
  idCaja?: number;         // ← id_caja
  nombreCaja?: string;     // ← nombre_caja
}

export interface CancelarCuentaResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idCuenta: number;
    numeroCuenta: string;
    titular: string;
    numeroDocumento: string;
    saldoFinal: number;
    motivoCancelacion: string;
    fechaCancelacion: Date;
  };
}

export interface EnviarTrasladoRequest {
  cajeroOrigen: string;
  cajeroDestino: string;
  monto: number;
  idUsuario?: number;      // ← NUEVO
  idCaja?: number;         // ← NUEVO  
  nombreCaja?: string;     // ← NUEVO
}

export interface EnviarTrasladoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTraslado: number;
    cajeroOrigen: string;
    cajeroDestino: string;
    monto: number;
    fechaEnvio: Date;
  };
}

export interface TrasladoPendiente {
  idTraslado: number;
  cajeroOrigen: string;
  monto: number;
  fechaEnvio: Date;
}

export interface ConsultarTrasladosResponse {
  exito: boolean;
  traslados: TrasladoPendiente[];
}

export interface AceptarTrasladoRequest {
  idTraslado: number;
  cajeroDestino: string;
  idUsuario?: number;      // ← NUEVO
  idCaja?: number;         // ← NUEVO  
  nombreCaja?: string;     // ← NUEVO
}

export interface AceptarTrasladoResponse {
  exito: boolean;
  mensaje: string;
  datos?: {
    idTraslado: number;
    cajeroOrigen: string;
    cajeroDestino: string;
    monto: number;
    fechaEnvio: Date;
    fechaAceptacion: Date;
  };
}


// ===== INTERFACE PARA LA CONSULTA DE SOLICITUDES =====
export interface SolicitudConsultaResponse {
  id_solicitud: number;
  id_asesor: number;  // Este es el id_usuario_rol
  cedula: string;
  tipo_documento?: string;
  fecha: string;
  fecha_respuesta?: string | null;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  producto: string;
  comentario_director?: string | null;
  comentario_asesor?: string | null;
  nombre_completo: string;
  genero?: string;
  estado_civil?: string;
  fecha_nacimiento?: string;
  nombre_asesor?: string;
  correo_asesor?: string;
}

// ===== RESPUESTAS DE LA API PARA CONSULTAS =====
export interface ConsultarSolicitudesResponse {
  success: boolean;
  message: string;
  data: SolicitudConsultaResponse[];
}

export interface ConsultarSolicitudResponse {
  success: boolean;
  message: string;
  data: SolicitudConsultaResponse;
}

export interface VerificarExistenciaResponse {
  success: boolean;
  existe: boolean;
}

// ===== NUEVAS INTERFACES PARA DETALLE COMPLETO =====

export interface ClienteInfoBackend {
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  numero_documento: string;
  tipo_documento: string;
  fecha_nacimiento: Date;
  nacionalidad: string;
  genero: string;
  estado_civil: string;
}

export interface ContactoInfoBackend {
  correo?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
}

export interface ActividadEconomicaInfoBackend {
  ocupacion?: string;
  profesion?: string;
}

export interface SolicitudDetalleCompletaBackend {
  id_solicitud: number;
  id_cliente: number;
  id_asesor: number;
  tipo_cuenta: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Devuelta';
  comentario_director?: string;
  comentario_asesor?: string;
  fecha_solicitud: Date;
  fecha_respuesta?: Date;
  tiene_archivo: boolean;
  cliente: ClienteInfoBackend;
  contacto: ContactoInfoBackend;
  actividad_economica: ActividadEconomicaInfoBackend;
}

export interface SolicitudDetalleResponse {
  success: boolean;
  message: string;
  data: SolicitudDetalleCompletaBackend;
}

export interface AccionSolicitudRequest {
  comentario?: string;
}

export interface AccionSolicitudResponse {
  success: boolean;
  message: string;
}