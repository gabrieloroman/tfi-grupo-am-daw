import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReservasController } from "./controllers/reservas.controller.js";
import { MedicosController } from "./controllers/medicos.controller.js";
import { Medico } from "./entities/medico.entity.js";
import { Reserva } from "./entities/reserva.entity.js";
import { MedicosService } from "./services/medicos.service.js";
import { ReservasService } from "./services/reservas.service.js";
import { Usuario } from "../auth/entities/usuario.entity.js";
import { AuthModule } from "../auth/auth.module.js";


@Module({
    imports: [TypeOrmModule.forFeature([Medico, Reserva,Usuario]),
    AuthModule],
    controllers: [ReservasController, MedicosController],
    providers: [MedicosService, ReservasService],
    exports: []
})
export class ClinicaModule {

}
