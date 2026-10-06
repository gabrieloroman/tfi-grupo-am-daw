import { Body, Controller, Get, NotImplementedException, Param, Put, UseGuards } from "@nestjs/common";
import { UpdateValorConsultaDto } from "../dtos/input/update-valor-consulta.dto.js";
import { ApiBearerAuth, ApiOkResponse } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";

@Controller('medicos')
export class MedicosController {

    constructor() { }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Put(":id/valor-consulta")
    async actualizarValorConsulta(@Param("id") id: number, @Body() dto: UpdateValorConsultaDto): Promise<void> {
        throw new NotImplementedException();
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOkResponse({ type: MedicoDTO, isArray: true })
    @Get()
    async obtenerMedicos(): Promise<MedicoDTO[]> {
        throw new NotImplementedException();
    }

}
