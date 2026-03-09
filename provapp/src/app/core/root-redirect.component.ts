import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root-redirect',
  standalone: true,
  template: '<p>Reindirizzamento...</p>',
})
export class RootRedirectComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    // se non autenticato, lascia router gestire (tornare alla login SSO)
    if (!this.auth.isLoggedIn()) {
      // l'inizializzazione di Keycloak farà il redirect alla stessa URL
      return;
    }

    if (this.auth.hasRole('docente')) {
      this.router.navigate(['/docente']);
    } else if (this.auth.hasRole('studente')) {
      this.router.navigate(['/studente']);
    } else {
      // ruolo sconosciuto -> accesso negato
      this.router.navigate(['/accesso-negato']);
    }
  }
}
