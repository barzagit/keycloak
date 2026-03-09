import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGuardService {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivateWithRole(role: string): boolean {
    if (this.authService.hasRole(role)) {
      return true;
    }
    this.router.navigate(['/accesso-negato']);
    return false;
  }
}

// Guard funzionale per docenti
export const docenteGuard: CanActivateFn = (route, state) => {
  const guardService = inject(RoleGuardService);
  return guardService.canActivateWithRole('docente');
};

// Guard funzionale per studenti
export const studenteGuard: CanActivateFn = (route, state) => {
  const guardService = inject(RoleGuardService);
  return guardService.canActivateWithRole('studente');
};
