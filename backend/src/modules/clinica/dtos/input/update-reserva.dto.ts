import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { EstadosReservasEnum } from "../../enums/estados-reservas.enum.js";

export class UpdateReservaDto {

    @ApiProperty({ enum: EstadosReservasEnum })
    @IsEnum(EstadosReservasEnum)
    @IsNotEmpty()
    estado!: EstadosReservasEnum;

}
