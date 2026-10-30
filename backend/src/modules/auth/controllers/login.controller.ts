import { Body, Controller, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LoginDTO } from "../dtos/input/login.dto.js";
import { LoginResponseDTO } from "../dtos/output/login-response.dto.js";
import { AuthService } from "../services/auth.service.js";

@Controller("auth")
export class LoginController {

    constructor(private readonly service: AuthService) { }

    @ApiCreatedResponse({ type: LoginResponseDTO })
    @ApiUnauthorizedResponse({ description: "Documento o clave incorrectos, o usuario dado de baja" })
    @Post()
    async login(@Body() dto: LoginDTO): Promise<LoginResponseDTO> {
        return await this.service.login(dto);
    }

}
