import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Usuario } from "../../auth/entities/usuario.entity.js";
import { EstadosReservasEnum } from "../enums/estados-reservas.enum.js";
import type { Medico } from "./medico.entity.js";

@Entity({ name: "reservas" })
export class Reserva {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: "id_medico" })
    idMedico!: number;

    @ManyToOne("Medico")
    @JoinColumn({ name: "id_medico" })
    medico!: Medico;

    @Column({ name: "id_paciente" })
    idPaciente!: number;

    @ManyToOne("Usuario")
    @JoinColumn({ name: "id_paciente" })
    paciente!: Usuario;

    @Column({ name: "fecha_hora", type: "timestamp" })
    fechaHora!: Date;

    @Column({ type: "enum", enum: EstadosReservasEnum, enumName: "estados_reservas" })
    estado!: EstadosReservasEnum;

    @Column({ name: "valor_consulta" })
    valorConsulta!: number;

}
