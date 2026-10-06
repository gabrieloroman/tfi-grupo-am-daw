import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, NotImplementedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindOptionsWhere, Repository } from "typeorm";
import { Reserva } from "../entities/reserva.entity.js";
import { MedicosService } from "./medicos.service.js";
import { ListReservaDTO } from "../dtos/output/list-reserva.dto.js";
import { EstadosReservasEnum } from "../enums/estados-reservas.enum.js";
import { RolesUsuariosEnum } from "../enums/roles-usuarios.enum.js";

@Injectable()
export class ReservasService {

    constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>,
        private readonly medicosService: MedicosService) { }

    async listar(idUsuario: number, rol: RolesUsuariosEnum, fecha: string, estado?: EstadosReservasEnum): Promise<ListReservaDTO[]> {

        if (rol !== RolesUsuariosEnum.MEDICO) {
            throw new NotImplementedException();
        }

        const medico = await this.medicosService.buscarPorIdUsuario(idUsuario);

        const where: FindOptionsWhere<Reserva> = {
            idMedico: medico.id,
            fechaHora: Between(new Date(`${fecha}T00:00:00`), new Date(`${fecha}T23:59:59.999`)),
        };

        if (estado) {
            where.estado = estado;
        }

        const reservas = await this.repository.find({
            where,
            relations: { medico: { usuario: true }, paciente: true },
            order: { fechaHora: "ASC" },
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

}
