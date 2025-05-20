import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LOZApiService {
  private baseUrl = 'https://botw-compendium.herokuapp.com/api/v3/compendium';

  constructor(private http: HttpClient) {}

  getAllMonsters(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/category/monsters`);
  }

  getAllWeapons(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/category/equipment`);
  }

  // neu: universelle Entry-Abfrage für Weapon oder Monster
  getEntryById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/entry/${id}`);
  }
}
