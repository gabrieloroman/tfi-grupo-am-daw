import { ForbiddenException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Medico } from "../entities/medico.entity.js";
import { MedicoDTO } from "../dtos/output/medico.dto.js";
import { EstadosUsuariosEnum } from "../enums/estados-usuarios.enum.js";
import { RolesUsuariosEnum } from "../enums/roles-usuarios.enum.js";

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

    async actualizarValorConsulta(rol: RolesUsuariosEnum, id: number, valorConsulta: number): Promise<void> {

        if (rol !== RolesUsuariosEnum.ADMINISTRADOR) {
            throw new ForbiddenException(
                "Solo el administrador puede cambiar el valor de consulta"
            );
        }

        if (!Number.isInteger(valorConsulta) || valorConsulta <= 0) {
            throw new BadRequestException(
                "El valor de consulta debe ser un número entero positivo"
            );
        }

        const medico = await this.buscarPorId(id);

        medico.valorConsulta = valorConsulta;

        await this.repository.save(medico);
    }

}
