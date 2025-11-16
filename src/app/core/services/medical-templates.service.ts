import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MedicalTemplatesService {
  // private readonly http = inject(HttpClient);
  //private get base() { return environment.apiUrl; }
  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  list() {
    return this.http.get<any>(`${this.baseUrl}/medical-templates`).pipe(
      map((r) => r?.data?.items ?? r?.items ?? r?.results ?? [])
    );
  }

  create(form: FormData) {
    return this.http.post(`${this.baseUrl}/medical-templates/upload`, form);
  }

  update(id: number, form: FormData) {
    return this.http.patch(`${this.baseUrl}/medical-templates/${id}`, form);
  }

  remove(id: number) {
    return this.http.delete(`${this.baseUrl}/medical-templates/${id}`);
  }


  // getPdf(id: number) {
  //   return this.http.get(
  //     `${environment.apiUrl}/medical-templates/${id}/download`,
  //     {
  //       responseType: 'blob',
  //     },
  //   );
  // }

  getPdf(id: number | string ): Observable<Blob> {
    const url = `${this.baseUrl}/medical-templates/${id}/download`;
    return this.http.get<Blob>(url, { responseType: 'blob' as 'json' });
  }

}
