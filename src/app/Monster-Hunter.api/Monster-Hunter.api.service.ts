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
    return this.http.get<any[]>(`${this.baseUrl}/weapons`);
  }

}
