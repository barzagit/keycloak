import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { signal } from '@angular/core';
import { RegistroService, Voto, InsertVotoRequest } from '../../services/registro-service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-docente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './docente.html',
  styleUrls: ['./docente.css'],
})
export class DocenteComponent implements OnInit {
  voti = signal<Voto[]>([]);
  error = signal('');
  successMessage = signal('');
  loading = signal(false);

  // Form per inserire voto
  newVoto = signal<InsertVotoRequest>({
    username_studente: '',
    nome_studente: '',
    materia: '',
    voto: 0,
  });

  private registroService = inject(RegistroService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadVoti();
  }

  loadVoti(): void {
    this.loading.set(true);
    this.registroService.getAllVoti().subscribe({
      next: (data) => {
        this.voti.set(data.voti);
        this.error.set('');
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Errore nel caricamento dei voti');
        console.error('Errore:', err);
        this.loading.set(false);
      },
    });
  }

  inserisciVoto(): void {
    const voto = this.newVoto();
    console.log('inserisciVoto called with', voto);

    // Validazione
    if (!voto.username_studente || !voto.username_studente.trim() ||
        !voto.nome_studente || !voto.nome_studente.trim() ||
        !voto.materia || !voto.materia.trim()) {
      this.error.set('Compilare tutti i campi');
      console.log('validation failed: missing field', voto);
      return;
    }

    if (voto.voto < 0 || voto.voto > 10) {
      this.error.set('Il voto deve essere tra 0 e 10');
      return;
    }

    this.registroService.insertVoto(voto).subscribe({
      next: () => {
        this.successMessage.set('Voto inserito con successo!');
        this.newVoto.set({
          username_studente: '',
          nome_studente: '',
          materia: '',
          voto: 0,
        });
        this.error.set('');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.loadVoti(); // Ricarica i voti
      },
      error: (err) => {
        this.error.set('Errore nell\'inserimento del voto');
        console.error('Errore:', err);
      },
    });
  }

  eliminaVoto(votoId: number): void {
    if (confirm('Vuoi eliminare questo voto?')) {
      this.registroService.deleteVoto(votoId).subscribe({
        next: () => {
          this.successMessage.set('Voto eliminato con successo!');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.loadVoti();
        },
        error: (err) => {
          this.error.set('Errore nell\'eliminazione del voto');
          console.error('Errore:', err);
        },
      });
    }
  }

  updateNewVoto(field: keyof InsertVotoRequest, value: any): void {
    const current = this.newVoto();
    this.newVoto.set({
      ...current,
      [field]: field === 'voto' ? Number(value) : value,
    });
  }
}
