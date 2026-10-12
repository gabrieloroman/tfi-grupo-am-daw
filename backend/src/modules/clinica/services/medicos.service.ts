import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medico } from "../entities/medico.entity.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum.js";

@Injectable()
export class MedicosService {

    constructor(@InjectRepository(Medico) private readonly repository: Repository<Medico>) { }

    async listar(): Promise<MedicoDTO[]> {

        const medicos = await this.repository.find({
            where: { usuario: { estado: EstadosUsuariosEnum.ACTIVO } },
            relations: { usuario: true },
            order: { usuario: { apellidos: "ASC", nombres: "ASC" } },
        });

        return medicos.map((medico) => ({
            id: medico.id,
            nombres: medico.usuario.nombres,
            apellidos: medico.usuario.apellidos,
            matricula: medico.matricula,
            valorConsulta: medico.valorConsulta,
        }));
    }

    async buscarPorIdUsuario(idUsuario: number): Promise<Medico> {

        const medico = await this.repository.findOne({ where: { idUsuario } });

        if (!medico) {
            throw new ForbiddenException("El usuario no tiene un medico asociado");
        }

        return medico;
    }

    async buscarPorId(id: number): Promise<Medico> {

        const medico = await this.repository.findOne({ where: { id } });

        if (!medico) {
            throw new NotFoundException("Medico no encontrado");
        }

        return medico;
    }

}
