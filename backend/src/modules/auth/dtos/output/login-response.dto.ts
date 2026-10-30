import { ApiProperty } from "@nestjs/swagger";

// (jt) Respuesta del login: el token JWT con el id, los nombres y el rol del usuario
export class LoginResponseDTO {

    @ApiProperty({ description: "Token JWT para enviar como 'Authorization: Bearer <token>'" })
    accessToken!: string;

}
