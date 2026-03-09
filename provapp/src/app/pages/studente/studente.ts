import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal } from '@angular/core';
import { RegistroService, Voto } from '../../services/registro-service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-studente',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './studente.html',
  styleUrls: ['./studente.css'],
})
export class StudenteComponent implements OnInit {
  voti = signal<Voto[]>([]);
  error = signal('');
  loading = signal(false);
  username = signal('');

  private registroService = inject(RegistroService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.username.set(this.authService.getUsername());
    this.loadVotiStudente();
  }

  loadVotiStudente(): void {
    this.loading.set(true);
    this.registroService.getVotiStudente().subscribe({
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

  calcolaMedia(): number {
    const voti = this.voti();
    if (voti.length === 0) return 0;
    const somma = voti.reduce((acc, v) => acc + v.voto, 0);
    return Math.round((somma / voti.length) * 100) / 100;
  }

  getStatoBadge(): { testo: string; classe: string } {
    const media = this.calcolaMedia();
    if (media === 0) return { testo: '-', classe: 'neutral' };
    if (media >= 8) return { testo: 'Eccellente!', classe: 'excellent' };
    if (media >= 7) return { testo: 'Buono', classe: 'good' };
    if (media >= 6) return { testo: 'Sufficiente', classe: 'sufficient' };
    return { testo: 'Insufficiente', classe: 'insufficient' };
  }

  getMaterieUniche(): string[] {
    const materieSet = new Set(this.voti().map((v) => v.materia));
    return Array.from(materieSet).sort();
  }

  getVotiPerMateria(materia: string): Voto[] {
    return this.voti()
      .filter((v) => v.materia === materia)
      .sort((a, b) => new Date(b.data_inserimento).getTime() - new Date(a.data_inserimento).getTime());
  }
}
