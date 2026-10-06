import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadosUsuariosEnum } from "../../clinica/enums/estados-usuarios.enum.js";
import { RolesUsuariosEnum } from "../../clinica/enums/roles-usuarios.enum.js";

@Entity({ name: "usuarios" })
export class Usuario {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    documento!: string;

    @Column()
    apellidos!: string;

    @Column()
    nombres!: string;

    @Column()
    email!: string;

    @Column()
    clave!: string;

    @Column({ type: "enum", enum: EstadosUsuariosEnum, enumName: "estados_usuarios" })
    estado!: EstadosUsuariosEnum;

    @Column({ type: "enum", enum: RolesUsuariosEnum, enumName: "roles_usuarios" })
    rol!: RolesUsuariosEnum;

}
