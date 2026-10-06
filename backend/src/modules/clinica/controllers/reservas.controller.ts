import { Body, Controller, Get, NotImplementedException, Param, ParseIntPipe, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { CreateReservaDto } from "../dtos/input/create-reserva.dto.js";
import { UpdateReservaDto } from "../dtos/input/update-reserva.dto.js";
import { ListReservasQueryDto } from "../dtos/input/list-reservas-query.dto.js";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { ListReservaDTO } from "../dtos/output/list-reserva.dto.js";
import { ReservaDTO } from "../dtos/output/reserva.dto.js";
import { RolesUsuariosEnum } from "../enums/roles-usuarios.enum.js";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { ReservasService } from "../services/reservas.service.js";

type RequestAutenticado = Request & { usuario: { sub: number; rol: RolesUsuariosEnum } };

@Controller('reservas')
export class ReservasController {

    constructor(private readonly service: ReservasService) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Post()
    async crearReserva(@Body() dto: CreateReservaDto): Promise<{ id: number }> {
        throw new NotImplementedException();
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Put(":id")
    async actualizarReserva(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateReservaDto, @Req() request: RequestAutenticado): Promise<void> {
        await this.service.marcarAsistencia(request.usuario.sub, request.usuario.rol, id, dto.estado);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: ListReservaDTO, isArray: true })
    @Get()
    async obtenerReservas(@Query() query: ListReservasQueryDto, @Req() request: RequestAutenticado): Promise<ListReservaDTO[]> {
        return await this.service.listar(request.usuario.sub, request.usuario.rol, query.fecha, query.estado);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: ReservaDTO })
    @Get(":id")
    async obtenerReserva(@Param("id") id: number): Promise<ReservaDTO> {
        throw new NotImplementedException();
    }

}
