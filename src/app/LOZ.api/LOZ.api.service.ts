 import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LOZApiService {
  private baseUrl = 'https://botw-compendium.herokuapp.com/api/v3';

  constructor(private http: HttpClient) {}

  getAllMonsters(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/category/monsters`);
  }
  getAllWeapons(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/compendium/category/equipment`);
}
  getWeaponById(id: string) {
    return this.http.get(`${this.baseUrl}/weapon/${id}`);
  }




}
