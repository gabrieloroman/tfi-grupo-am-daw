import { ForbiddenException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medico } from "../entities/medico.entity.js";

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

}
