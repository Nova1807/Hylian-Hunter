import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MonsterHunterApiService {
  private baseUrl = 'https://mhw-db.com';

  constructor(private http: HttpClient) {}

  getAllMonsters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/monsters`);
  }

  getMonsterById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/monsters/${id}`);
  }
// In MonsterHunterApiService
  getAllWeapons(): Observable<any[]> {
    // Add ?include=crafting to get weapon crafting data
    return this.http.get<any[]>(`${this.baseUrl}/weapons?include=crafting`);
  }
  // MonsterHunterApiService
  getWeaponById(id: number): Observable<any> {
    return this.http.get<any>(
      `https://api.mhw-db.com/weapons/${id}?include=assets,crafting`
    );
  }
  getWeaponsByIds(ids: number[]): Observable<any[]> {
    return this.http.get<any[]>(
      `https://api.mhw-db.com/weapons?q={"id_in": [${ids.join(',')}]}`
    );
  }
}
