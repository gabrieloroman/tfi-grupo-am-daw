import { Body, Controller, Get, Req, Param, Put, UseGuards, ParseIntPipe } from "@nestjs/common";
import { UpdateValorConsultaDto } from "../dtos/input/update-valor-consulta.dto.js";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";
import { MedicosService } from "../services/medicos.service.js";
import type { Request } from "express";
import { RolesUsuariosEnum } from "../enums/roles-usuarios.enum.js";

type RequestAutenticado = Request & {
    usuario: {
        sub: number;
        rol: RolesUsuariosEnum;
    };
};

@Controller('medicos')
export class MedicosController {

    constructor(private readonly service: MedicosService) { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Put(":id/valor-consulta")
    async actualizarValorConsulta(
        @Param("id", ParseIntPipe) id: number, 
        @Body() dto: UpdateValorConsultaDto, 
        @Req() request: RequestAutenticado
    ): Promise<void> {
        await this.service.actualizarValorConsulta(request.usuario.rol, id, dto.valorConsulta);
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: MedicoDTO, isArray: true })
    @Get()
    async obtenerMedicos(): Promise<MedicoDTO[]> {
        return await this.service.listar();
    }

}
