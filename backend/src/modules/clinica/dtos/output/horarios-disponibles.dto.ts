import { ApiProperty } from "@nestjs/swagger";

export class HorariosDisponiblesDTO {

    @ApiProperty({ example: "2026-10-20" })
    fecha!: string;

    @ApiProperty({ type: [String], example: ["2026-10-20T08:00:00", "2026-10-20T11:00:00"] })
    horarios!: string[];

}