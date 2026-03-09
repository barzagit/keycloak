import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { docenteGuard, studenteGuard } from './core/role.guard';
import { DocenteComponent } from './pages/docente/docente';
import { StudenteComponent } from './pages/studente/studente';
import { AccessoNegatoComponent } from './pages/accesso-negato/accesso-negato';
import { RootRedirectComponent } from './core/root-redirect.component';

export const routes: Routes = [
  // root redirect dopo login
  { path: '', component: RootRedirectComponent, canActivate: [authGuard] },
  { path: 'docente', component: DocenteComponent, canActivate: [authGuard, docenteGuard] },
  { path: 'studente', component: StudenteComponent, canActivate: [authGuard, studenteGuard] },
  { path: 'accesso-negato', component: AccessoNegatoComponent },
  { path: '**', redirectTo: '' },
];