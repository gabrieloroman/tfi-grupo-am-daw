import { Body, Controller, ForbiddenException, Get, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateReservaDto } from "../dtos/input/create-reserva.dto.js";
import { UpdateReservaDto } from "../dtos/input/update-reserva.dto.js";
import { ListReservasQueryDto } from "../dtos/input/list-reservas-query.dto.js";
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { ListReservaDTO } from "../dtos/output/list-reserva.dto.js";
import { ReservaCreadaDTO } from "../dtos/output/reserva-creada.dto.js";
import { RolesUsuariosEnum } from "../enums/roles-usuarios.enum.js";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { ReservasService } from "../services/reservas.service.js";
import { DisponibilidadQueryDto } from "../dtos/input/disponibilidad-query.dto.js";
import { HorariosDisponiblesDTO } from "../dtos/output/horarios-disponibles.dto.js";
import { EstadosReservasEnum } from "../enums/estados-reservas.enum.js";
import { UsuariosService } from "../../auth/services/usuarios.service.js";
import { PacienteDTO } from "../dtos/output/paciente.dto.js";


type RequestAutenticado = Request & { usuario: { sub: number; rol: RolesUsuariosEnum } };

@Controller('reservas')
export class ReservasController {

    constructor(private readonly service: ReservasService,
        private readonly usuariosService: UsuariosService        //<---inyeccion del servicio de usuarios-->
        
    ) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiCreatedResponse({ type: ReservaCreadaDTO })
    @Post()
    // (hz) El paciente reserva un turno (el id del paciente sale del token)
    // (jt) El administrador reserva para el paciente que indica en idPaciente
    async crearReserva(@Body() dto: CreateReservaDto, @Req() request: RequestAutenticado): Promise<ReservaCreadaDTO> {
        return await this.service.crear(request.usuario.sub, request.usuario.rol, dto);
    }


    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ description: "Reserva cancelada (paciente o administrador) o asistencia registrada (médico)" })
    @Put(":id")
    async actualizarReserva(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateReservaDto, @Req() request: RequestAutenticado): Promise<void> {
        // (hz) Si el estado es CANCELADO, cancela; si no, el médico marca asistencia (igual que antes)
        if (dto.estado === EstadosReservasEnum.CANCELADO) {
            await this.service.cancelar(request.usuario.sub, request.usuario.rol, id);
        } else {
            await this.service.marcarAsistencia(request.usuario.sub, request.usuario.rol, id, dto.estado);
        }
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: ListReservaDTO, isArray: true })
    @Get()
    async obtenerReservas(@Query() query: ListReservasQueryDto, @Req() request: RequestAutenticado): Promise<ListReservaDTO[]> {
        return await this.service.listar(request.usuario.sub, request.usuario.rol, query.fecha, query.estado);
    }

    // (hz) Horarios libres de un médico en una fecha.
    
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: HorariosDisponiblesDTO })
    @Get("disponibilidad")
    async obtenerDisponibilidad(@Query() query: DisponibilidadQueryDto): Promise<HorariosDisponiblesDTO> {
        return await this.service.horariosDisponibles(Number(query.idMedico), query.fecha);
    }
        // Nuevo endpoint: listar pacientes activos
    // (jt) Solo para el administrador, que elige paciente al reservar
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: PacienteDTO, isArray: true })
    @Get("pacientes-activos")
    async obtenerPacientesActivos(@Req() request: RequestAutenticado): Promise<PacienteDTO[]> {
        if (request.usuario.rol !== RolesUsuariosEnum.ADMINISTRADOR) {
            throw new ForbiddenException("Solo el administrador puede listar pacientes");
        }
        return await this.usuariosService.listarPacientesActivos();
    }
}
