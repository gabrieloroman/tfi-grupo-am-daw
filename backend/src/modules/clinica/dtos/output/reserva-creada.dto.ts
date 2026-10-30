import { ApiProperty } from "@nestjs/swagger";

// (jt) Respuesta al crear una reserva: el id de la reserva nueva
export class ReservaCreadaDTO {

    @ApiProperty()
    id!: number;

}
