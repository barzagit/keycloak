import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Keycloak from 'keycloak-js';

export interface Voto {
  id: number;
  username_studente: string;
  nome_studente: string;
  materia: string;
  voto: number;
  data_inserimento: string;
  username_docente: string;
}

export interface InsertVotoRequest {
  username_studente: string;
  nome_studente: string;
  materia: string;
  voto: number;
}

@Injectable({
  providedIn: 'root',
})
export class RegistroService {
  private http = inject(HttpClient);
  private keycloak = inject(Keycloak);

  private baseUrl = 'https://ideal-space-umbrella-q7jqpxp6x99xfpr-5000.app.github.dev';

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.keycloak.token}`,
    });
  }

  // Docente: ottiene tutti i voti
  getAllVoti(): Observable<{ voti: Voto[] }> {
    return this.http.get<{ voti: Voto[] }>(`${this.baseUrl}/voti`, {
      headers: this.getHeaders(),
    });
  }

  // Studente: ottiene i propri voti
  getVotiStudente(): Observable<{ voti: Voto[] }> {
    return this.http.get<{ voti: Voto[] }>(`${this.baseUrl}/voti/studente`, {
      headers: this.getHeaders(),
    });
  }

  // Docente: inserisce un voto
  insertVoto(voto: InsertVotoRequest): Observable<{ message: string; voto: Voto }> {
    return this.http.post<{ message: string; voto: Voto }>(`${this.baseUrl}/voti`, voto, {
      headers: this.getHeaders(),
    });
  }

  // Docente: elimina un voto
  deleteVoto(votoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/voti/${votoId}`, {
      headers: this.getHeaders(),
    });
  }
}
