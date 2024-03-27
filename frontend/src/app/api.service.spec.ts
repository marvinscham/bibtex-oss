import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch BibTex by DOI', () => {
    const mockResponse = 'Mocked response text';
    const doi = '10.1000/xyz123';

    service.getBibTexByDoi(doi).subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/doi/${encodeURIComponent(doi)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch BibTex by ISBN', () => {
    const mockResponse = 'Mocked response text';
    const isbn = '123456789';

    service.getBibTexByIsbn(isbn).subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/isbn/${encodeURIComponent(isbn)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch BibTex by URL', () => {
    const mockResponse = 'Mocked response text';
    const url = 'http://example.com';

    service.getBibTexByUrl(url).subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/url/${encodeURIComponent(url)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch BibTex by arXiv', () => {
    const mockResponse = 'Mocked response text';
    const arxivId = '0123.2345';

    service.getBibTexByArxiv(arxivId).subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/arxiv/${encodeURIComponent(arxivId)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should tidy a BibTex string', () => {
    const mockResponse = 'Tidied BibTex';
    const bibtex = 'Original BibTex';

    service.tidyBibtex(bibtex).subscribe((response) => {
      expect(response.body).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`/api/tidy`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(bibtex);
    req.flush(mockResponse);
  });
});
