import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
    ReservarTurnoApiClient,
    type MedicoDTO,
} from '../reservar-turno/reservar-turno-api-client';

@Component({
    selector: 'app-valor-consulta',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './valor-consulta.html',
})
export class ValorConsulta implements OnInit {
    private readonly api = inject(ReservarTurnoApiClient);
    private readonly cdr = inject(ChangeDetectorRef);

    medicos: MedicoDTO[] = [];
    valores: Record<number, number> = {};

    cargando = false;
    guardando: number | null = null;
    mensaje = '';
    error = '';

    ngOnInit(): void {
        this.listarMedicos();
    }

    listarMedicos(): void {
        this.cargando = true;
        this.error = '';

        this.api.listarMedicos().subscribe({
            next: (medicos) => {
                console.log('Médicos recibidos:', medicos);

                this.medicos = medicos;

                this.valores = {};
                for (const medico of medicos) {
                    this.valores[medico.id] = medico.valorConsulta;
                }

                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'No se pudieron cargar los médicos.';
                this.cargando = false;
                this.cdr.detectChanges();
            },
            complete: () => {
                console.log('Carga de médicos finalizada');
            },
        });
    }

    guardar(medico: MedicoDTO): void {
        const nuevoValor = this.valores[medico.id];

        this.mensaje = '';
        this.error = '';

        if (
            nuevoValor == null ||
            !Number.isInteger(nuevoValor) ||
            nuevoValor <= 0
        ) {
            this.error = 'Ingresá un valor de consulta mayor que cero.';
            return;
        }

        this.guardando = medico.id;
        this.cdr.detectChanges();

        this.api.actualizarValorConsulta(medico.id, nuevoValor).subscribe({
            next: () => {
                medico.valorConsulta = nuevoValor;
                this.mensaje = 'Valor de consulta actualizado correctamente.';
                this.guardando = null;
                this.cdr.detectChanges();
            },
            error: () => {
                this.error = 'No se pudo actualizar el valor de consulta.';
                this.guardando = null;
                this.cdr.detectChanges();
            },
        });
    }
}