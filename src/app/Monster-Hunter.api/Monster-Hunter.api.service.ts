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

  getAllWeapons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/weapons?include=crafting`);
  }

  getWeaponById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/weapons/${id}?include=assets,crafting`);
  }

  getWeaponsByIds(ids: number[]): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/weapons?q={"id_in": [${ids.join(',')}]}`
    );
  }

  getArmorByIds(ids: number[]): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.baseUrl}/armor?q={"id_in": [${ids.join(',')}]}`
    );
  }

  getAllArmors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/armor?include=crafting`);
  }
}
