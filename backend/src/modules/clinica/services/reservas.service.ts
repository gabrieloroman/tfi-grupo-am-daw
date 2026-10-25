import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindOptionsWhere, Repository,Not } from "typeorm";
import { Reserva } from "../entities/reserva.entity.js";
import { MedicosService } from "./medicos.service.js";
import { ListReservaDTO } from "../dtos/output/list-reserva.dto.js";
import { EstadosReservasEnum } from "../enums/estados-reservas.enum.js";
import { RolesUsuariosEnum } from "../enums/roles-usuarios.enum.js";
import { HorariosDisponiblesDTO } from "../dtos/output/horarios-disponibles.dto.js";
import { CreateReservaDto } from "../dtos/input/create-reserva.dto.js";
import { Usuario } from "../../auth/entities/usuario.entity.js";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum.js";

// (hz) Reglas de negocio del TP
const HORA_APERTURA = 8;
const HORA_CIERRE = 16;
const DIAS_MAXIMOS_ANTICIPACION = 30;


@Injectable()
export class ReservasService {

    constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>,
        private readonly medicosService: MedicosService,
        @InjectRepository(Usuario) private readonly usuarioRepository: Repository<Usuario>,//agrego reposit4----
    ) { }

        async listar(idUsuario: number, rol: RolesUsuariosEnum, fecha?: string, estado?: EstadosReservasEnum): Promise<ListReservaDTO[]> {

            const where: FindOptionsWhere<Reserva> = {};
    
            if (rol === RolesUsuariosEnum.MEDICO) {
                if (!fecha) {
                    throw new BadRequestException("La fecha es obligatoria y debe tener formato YYYY-MM-DD");
                }
                const medico = await this.medicosService.buscarPorIdUsuario(idUsuario);
                where.idMedico = medico.id;
                where.fechaHora = this.rangoDelDia(fecha);
            } else if (rol === RolesUsuariosEnum.PACIENTE) {
                where.idPaciente = idUsuario;
                if (fecha) {
                    where.fechaHora = this.rangoDelDia(fecha);
                }
            } else if (rol=== RolesUsuariosEnum.ADMINISTRADOR){ //Agrego Administrador 4-----------------------
                if(fecha){
                     where.fechaHora = this.rangoDelDia(fecha);
                }
            } else {   
                throw new NotImplementedException(); 
            }
            //---------------------------------
            if (estado) {
                where.estado = estado;
            }
    
            const reservas = await this.repository.find({
                where,
                relations: { medico: { usuario: true }, paciente: true },
                order: { fechaHora: rol === RolesUsuariosEnum.PACIENTE ? "DESC" : "ASC" },
            });
    
            return reservas.map((reserva) => ({
                id: reserva.id,
                medico: `${reserva.medico.usuario.apellidos} ${reserva.medico.usuario.nombres}`,
                paciente: `${reserva.paciente.apellidos} ${reserva.paciente.nombres}`,
                documentoPaciente: reserva.paciente.documento,
                fechaHora: reserva.fechaHora,
                estado: reserva.estado,
                valorConsulta: reserva.valorConsulta,
            }));
        }

        // (hz) El paciente reserva un turno para sí mismo
        async crear(idUsuario: number, rol: RolesUsuariosEnum, dto: CreateReservaDto): Promise<{ id: number }> {
            let idPacienteAUsar = idUsuario;//agrego variable----
            if (rol === RolesUsuariosEnum.ADMINISTRADOR){
                if (!dto.idPaciente){
                    throw new BadRequestException("El administrador debe indicar el id del paciente");
                }
                // validamos que el paciente exista, sea rol paciente y este activo
                const paciente = await this.usuarioRepository.findOne({
                    where: {id: dto.idPaciente,rol: RolesUsuariosEnum.PACIENTE}
                });
                if(!paciente || paciente.estado !== EstadosUsuariosEnum.ACTIVO){
                    throw new BadRequestException("El paciente no existe o no esta activo");
                }
                idPacienteAUsar = dto.idPaciente;

            } else if (rol !== RolesUsuariosEnum.PACIENTE) {
                throw new NotImplementedException(); // ADMINISTRADOR: lo implementa otro integrante (usa dto.idPaciente)
            }
    
            const fechaHora = new Date(dto.fechaHora);
            this.validarFechaDeReserva(fechaHora);
    
            const medico = await this.medicosService.buscarPorId(dto.idMedico);
    
            // Regla: no se puede reservar un horario ya ocupado (los cancelados liberan el horario)
            const ocupado = await this.repository.exists({
                where: { idMedico: medico.id, fechaHora, estado: Not(EstadosReservasEnum.CANCELADO) },
            });
    
            if (ocupado) {
                throw new ConflictException("El horario seleccionado ya esta ocupado");
            }
    
            const reserva = this.repository.create({
                idMedico: medico.id,
                idPaciente: idPacienteAUsar,//---cambio idUsuario por esto-----
                fechaHora,
                estado: EstadosReservasEnum.ACTIVO,
                valorConsulta: medico.valorConsulta, // Regla: se congela el valor al momento de reservar
            });
    
            const guardada = await this.repository.save(reserva);
    
            return { id: guardada.id };
        }
    
        // (hz) El paciente cancela un turno propio, solo hasta el día anterior a la consulta
        async cancelar(idUsuario: number, rol: RolesUsuariosEnum, id: number): Promise<void> {
    
            if (rol !== RolesUsuariosEnum.PACIENTE) {
                throw new NotImplementedException(); // ADMINISTRADOR: lo implementa otro integrante
            }
    
            const reserva = await this.repository.findOne({ where: { id } });
    
            if (!reserva) {
                throw new NotFoundException("Reserva no encontrada");
            }
    
            if (reserva.idPaciente !== idUsuario) {
                throw new ForbiddenException("La reserva pertenece a otro paciente");
            }
    
            if (reserva.estado !== EstadosReservasEnum.ACTIVO) {
                throw new ConflictException("Solo se puede cancelar una reserva en estado ACTIVO");
            }
    
            const ahora = new Date();
            const inicioDeManana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);
    
            if (reserva.fechaHora < inicioDeManana) {
                throw new BadRequestException("Solo se puede cancelar un turno hasta el dia anterior a la consulta");
            }
    
            reserva.estado = EstadosReservasEnum.CANCELADO;
    
            await this.repository.save(reserva);
        }
    
        // (hz) Horarios libres de un médico en una fecha (turnos de 1 hora, de 8 a 16)
        async horariosDisponibles(idMedico: number, fecha: string): Promise<HorariosDisponiblesDTO> {
    
            const medico = await this.medicosService.buscarPorId(idMedico);
    
            const ocupadas = await this.repository.find({
                where: { idMedico: medico.id, fechaHora: this.rangoDelDia(fecha), estado: Not(EstadosReservasEnum.CANCELADO) },
            });
    
            const horasOcupadas = new Set(ocupadas.map((reserva) => reserva.fechaHora.getHours()));
            const ahora = new Date();
            const limite = this.limiteDeAnticipacion();
            const horarios: string[] = [];
    
            for (let hora = HORA_APERTURA; hora < HORA_CIERRE; hora++) {
                const texto = `${fecha}T${String(hora).padStart(2, "0")}:00:00`;
                const turno = new Date(texto);
    
                if (turno > ahora && turno < limite && !horasOcupadas.has(hora)) {
                    horarios.push(texto);
                }
            }
    
            return { fecha, horarios };
        }    

    async marcarAsistencia(idUsuario: number, rol: RolesUsuariosEnum, id: number, estado: EstadosReservasEnum): Promise<void> {

        if (rol !== RolesUsuariosEnum.MEDICO) {
            throw new ForbiddenException("Solo un medico puede modificar el estado de una reserva");
        }

        if (estado === EstadosReservasEnum.CANCELADO) {
            throw new NotImplementedException();
        }

        if (estado !== EstadosReservasEnum.ATENDIDO && estado !== EstadosReservasEnum.AUSENTE) {
            throw new BadRequestException("El estado debe ser ATENDIDO o AUSENTE");
        }

        const medico = await this.medicosService.buscarPorIdUsuario(idUsuario);

        const reserva = await this.repository.findOne({ where: { id } });

        if (!reserva) {
            throw new NotFoundException("Reserva no encontrada");
        }

        if (reserva.idMedico !== medico.id) {
            throw new ForbiddenException("La reserva pertenece a otro medico");
        }

        if (reserva.estado !== EstadosReservasEnum.ACTIVO) {
            throw new ConflictException("Solo se puede modificar una reserva en estado ACTIVO");
        }

        const ahora = new Date();
        const inicioDeManana = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1);

        if (reserva.fechaHora >= inicioDeManana) {
            throw new BadRequestException("No se puede registrar la asistencia de un turno de un dia futuro");
        }

        reserva.estado = estado;

        await this.repository.save(reserva);
    }


    // ===================== (hz) Funciones auxiliares =====================

    private rangoDelDia(fecha: string) {
        return Between(new Date(`${fecha}T00:00:00`), new Date(`${fecha}T23:59:59.999`));
    }

    // Primer instante que queda fuera de los 30 días permitidos
    private limiteDeAnticipacion(): Date {
        const ahora = new Date();
        return new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + DIAS_MAXIMOS_ANTICIPACION + 1);
    }

    private validarFechaDeReserva(fechaHora: Date): void {

        if (isNaN(fechaHora.getTime())) {
            throw new BadRequestException("La fecha y hora no es valida");
        }

        if (fechaHora.getMinutes() !== 0 || fechaHora.getSeconds() !== 0 || fechaHora.getMilliseconds() !== 0) {
            throw new BadRequestException("Los turnos comienzan en hora en punto (por ejemplo 10:00)");
        }

        const hora = fechaHora.getHours();
        if (hora < HORA_APERTURA || hora >= HORA_CIERRE) {
            throw new BadRequestException(`El horario de atencion es de ${HORA_APERTURA} a ${HORA_CIERRE} hs`);
        }

        if (fechaHora <= new Date()) {
            throw new BadRequestException("No se puede reservar un turno en el pasado");
        }

        if (fechaHora >= this.limiteDeAnticipacion()) {
            throw new BadRequestException(`Solo se puede reservar con hasta ${DIAS_MAXIMOS_ANTICIPACION} dias de anticipacion`);
        }
    }

}
