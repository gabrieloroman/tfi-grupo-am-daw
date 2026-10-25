import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Usuario } from "../entities/usuario.entity.js";
import { EstadosUsuariosEnum } from "../../clinica/enums/estados-usuarios.enum.js";
import { RolesUsuariosEnum } from "../../clinica/enums/roles-usuarios.enum.js";

@Injectable()
export class UsuariosService {

    constructor(@InjectRepository(Usuario) private readonly repository: Repository<Usuario>) {

    }

    async buscarUsuarioActivoPorDocumento(documento: string): Promise<Usuario | null> {

        return await this.repository.findOne({ where: { documento, estado: EstadosUsuariosEnum.ACTIVO } })
    }
    //----nuevo metodo para que el admin pueda listar pacientes----
    async listarPacientesActivos(): Promise<Usuario[]> {
        return await this.repository.find({
            where: {
                rol: RolesUsuariosEnum.PACIENTE,
                estado: EstadosUsuariosEnum.ACTIVO
            }
        });

    }

}
