import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class MedicalTemplatesService {
  private readonly http = inject(HttpClient);
  private get base() { return environment.apiUrl; }

  list() {
    return this.http.get<any>(`${this.base}/medical-templates`).pipe(
      map((r) => r?.data?.items ?? r?.items ?? r?.results ?? [])
    );
  }

  create(form: FormData) {
    return this.http.post(`${this.base}/medical-templates/upload`, form);
  }

  update(id: number, form: FormData) {
    return this.http.patch(`${this.base}/medical-templates/${id}`, form);
  }

  remove(id: number) {
    return this.http.delete(`${this.base}/medical-templates/${id}`);
  }


  getPdf(id: number) {
  return this.http.get(
    `${environment.apiUrl}/medical-templates/${id}/download`,
    {
      responseType: 'blob',
    },
  );
}

}
