import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../entities/usuario.entity.js";
import { EstadosUsuariosEnum } from "../../clinica/enums/estados-usuarios.enum.js";
import { RolesUsuariosEnum } from "../../clinica/enums/roles-usuarios.enum.js";
import { PacienteDTO } from "../../clinica/dtos/output/paciente.dto.js";

@Injectable()
export class UsuariosService {

    constructor(@InjectRepository(Usuario) private readonly repository: Repository<Usuario>) {

    }

    async buscarUsuarioActivoPorDocumento(documento: string): Promise<Usuario | null> {

        return await this.repository.findOne({ where: { documento, estado: EstadosUsuariosEnum.ACTIVO } })
    }
    //----nuevo metodo para que el admin pueda listar pacientes----
    // (jt) Devuelve un DTO para no exponer la clave ni otros datos del usuario
    async listarPacientesActivos(): Promise<PacienteDTO[]> {
        const pacientes = await this.repository.find({
            where: {
                rol: RolesUsuariosEnum.PACIENTE,
                estado: EstadosUsuariosEnum.ACTIVO
            },
            order: { apellidos: "ASC", nombres: "ASC" },
        });

        return pacientes.map((paciente) => ({
            id: paciente.id,
            nombres: paciente.nombres,
            apellidos: paciente.apellidos,
            documento: paciente.documento,
        }));
    }

}
