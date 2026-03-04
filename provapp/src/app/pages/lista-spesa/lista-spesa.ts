import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class SpesaService {
  private http = inject(HttpClient);
  private keycloak = inject(Keycloak);

  //ricordate di aprire la porta del server
  private baseUrl = 'https://ideal-space-umbrella-q7jqpxp6x99xfpr-5000.app.github.dev'

  //ci serve per allegare il token ad ogni
  //richiesta http
  private getHeaders(): HttpHeaders {
    console.log('Token:', this.keycloak.token);
    return new HttpHeaders({
      Authorization: `Bearer ${this.keycloak.token}`,
    });
  }

  //lista condivisa uguale per tutti gli utenti
  getItems(): Observable<{ items: { id: number; nome: string }[] }> {
    return this.http.get<{ items: { id: number; nome: string }[] }>(
      `${this.baseUrl}/items`,
      { headers: this.getHeaders() }
    );
  }

  addItem(item: string): Observable<{ items: { id: number; nome: string }[] }> {
    return this.http.post<{ items: { id: number; nome: string }[] }>(
      `${this.baseUrl}/items`,
      { item },
      { headers: this.getHeaders() }
    );
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/items/${id}`,
      { headers: this.getHeaders() }
    );
  }
}
