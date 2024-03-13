import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private BASE_URL = '/api';

  constructor(private http: HttpClient) {}

  getBibTexByDoi(doi: string): Observable<HttpResponse<any>> {
    const url = `${this.BASE_URL}/doi/${encodeURIComponent(doi)}`;

    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  getBibTexByIsbn(isbn: string): Observable<HttpResponse<any>> {
    const url = `${this.BASE_URL}/isbn/${encodeURIComponent(isbn)}`;
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  getBibTexByUrl(uri: string): Observable<HttpResponse<any>> {
    const url = `${this.BASE_URL}/url/${encodeURIComponent(uri)}`;
    return this.http.get(url, { observe: 'response', responseType: 'text' });
  }

  tidyBibtex(bibtex: string): Observable<HttpResponse<any>> {
    const url = `${this.BASE_URL}/tidy`;
    return this.http.post(url, bibtex, {
      observe: 'response',
      responseType: 'text',
    });
  }
}
