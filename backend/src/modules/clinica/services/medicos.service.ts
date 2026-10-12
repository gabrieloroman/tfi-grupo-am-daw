import { ForbiddenException, Injectable,NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medico } from "../entities/medico.entity.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";

@Injectable()
export class MedicosService {

    constructor(@InjectRepository(Medico) private readonly repository: Repository<Medico>) { }

    async buscarPorIdUsuario(idUsuario: number): Promise<Medico> {

        const medico = await this.repository.findOne({ where: { idUsuario } });

        if (!medico) {
            throw new ForbiddenException("El usuario no tiene un medico asociado");
        }

        return medico;
    }

    //Agregado de funciones: buscar un médico por su ID y listar todos los médicos(hz)
    async buscarPorId(id: number): Promise<Medico> {

        const medico = await this.repository.findOne({ where: { id } });

        if (!medico) {
            throw new NotFoundException("Medico no encontrado");
        }

        return medico;
    }

    async listar(): Promise<MedicoDTO[]> {

        const medicos = await this.repository.find({
            relations: { usuario: true },
            order: { usuario: { apellidos: "ASC" } },
        });

        return medicos.map((medico) => ({
            id: medico.id,
            nombres: medico.usuario.nombres,
            apellidos: medico.usuario.apellidos,
            matricula: medico.matricula,
            valorConsulta: medico.valorConsulta,
        }));
    }



}
