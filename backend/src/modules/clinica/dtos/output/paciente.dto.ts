import { ApiProperty } from "@nestjs/swagger";

export class PacienteDTO {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

    @ApiProperty()
    documento!: string;

}
