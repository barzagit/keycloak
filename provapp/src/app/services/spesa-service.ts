import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Observable } from 'rxjs';
@Injectable({
providedIn: 'root',
})
export class SpesaService {
deleteItem(id: number) {
    throw new Error('Method not implemented.');
}
private http = inject(HttpClient);
private keycloak = inject(Keycloak);
//ricordate di aprire la porta del server
private baseUrl = 'https://ideal-space-umbrella-q7jqpxp6x99xfpr-5000.app.github.dev/'
//ci serve per allegare il token ad ogni
//richiesta http
private getHeaders(): HttpHeaders {
return new HttpHeaders({
Authorization: `Bearer ${this.keycloak.token}`,
});
}
getItems(): Observable<{ items: string[]; user: string }> {
return this.http.get<{ items: string[]; user: string }>(
`${this.baseUrl}/items`,
{ headers: this.getHeaders() }
);
}
addItem(item: string): Observable<{ items: string[] }> {
return this.http.post<{ items: string[] }>(
`${this.baseUrl}/items`,
{ item },
{ headers: this.getHeaders() }
);
}
}