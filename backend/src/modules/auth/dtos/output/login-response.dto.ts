import { ApiProperty } from "@nestjs/swagger";

export class LoginResponseDTO {

    @ApiProperty({ description: "Token JWT para enviar como 'Authorization: Bearer <token>'" })
    accessToken!: string;

}
