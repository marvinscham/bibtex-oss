const request = require('supertest');
const nock = require('nock');
const app = require('../server');

describe('/api/url/:url endpoint', () => {

    afterEach(() => {
        nock.cleanAll();
    });

    it('should return a BibTeX entry with webpage metadata from JSON_ld', async () => {
        const mockUrl = 'http://example.com';
        const mockHtml = `
      <html>
      <head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "author": {
              "@type": "Person",
              "name": "John Doe"
            },
            "headline": "Test Page Title",
            "datePublished": "2020-01-01"
          }
        </script>
      </head>
      <body></body>
      </html>
    `;

        // Mock the external URL request
        nock(mockUrl)
            .get('/')
            .reply(200, mockHtml);

        const response = await request(app)
            .get(`/api/url/${encodeURIComponent(mockUrl)}`)
            .expect(200);

        expect(response.text).toContain('@online');
        expect(response.text).toContain('author       = {John Doe}');
        expect(response.text).toContain('title        = {{Test Page Title}}');
        expect(response.text).toContain('year         = 2020');
        expect(response.text).toContain('url          = {http://example.com}');
    });

    it('should return a BibTeX entry with webpage metadata from alternative metadata (set 1)', async () => {
        const mockUrl = 'http://example.com';
        const mockHtml = `
      <html>
      <head>
        <meta name="author" content="John Doe">
        <meta name="og:title" content="Test Page Title">
        <meta property="article:published_time" content="2020-01-01">
      </head>
      <body></body>
      </html>
    `;

        // Mock the external URL request
        nock(mockUrl)
            .get('/')
            .reply(200, mockHtml);

        const response = await request(app)
            .get(`/api/url/${encodeURIComponent(mockUrl)}`)
            .expect(200);

        expect(response.text).toContain('@online');
        expect(response.text).toContain('author       = {John Doe}');
        expect(response.text).toContain('title        = {{Test Page Title}}');
        expect(response.text).toContain('year         = 2020');
        expect(response.text).toContain('url          = {http://example.com}');
    });

    it('should return a BibTeX entry with webpage metadata from alternative metadata (set 2)', async () => {
        const mockUrl = 'http://example.com';
        const mockHtml = `
      <html>
      <head>
        <meta name="twitter:data1" content="John Doe">
        <meta name="title" content="Test Page Title">
      </head>
      <body></body>
      </html>
    `;

        // Mock the external URL request
        nock(mockUrl)
            .get('/')
            .reply(200, mockHtml);

        const response = await request(app)
            .get(`/api/url/${encodeURIComponent(mockUrl)}`)
            .expect(200);

        expect(response.text).toContain('@online');
        expect(response.text).toContain('author       = {John Doe}');
        expect(response.text).toContain('title        = {{Test Page Title}}');
        expect(response.text).toContain('url          = {http://example.com}');
    });

    it('should return a BibTeX entry with webpage metadata from alternative metadata (set 3)', async () => {
        const mockUrl = 'http://example.com';
        const mockHtml = `
      <html>
      <head>
        <title>Test Page Title</title>
      </head>
      <body></body>
      </html>
    `;

        // Mock the external URL request
        nock(mockUrl)
            .get('/')
            .reply(200, mockHtml);

        const response = await request(app)
            .get(`/api/url/${encodeURIComponent(mockUrl)}`)
            .expect(200);

        expect(response.text).toContain('@online');
        expect(response.text).toContain('title        = {{Test Page Title}}');
        expect(response.text).toContain('url          = {http://example.com}');
    });

    it('should return a BibTeX entry with no webpage metadata', async () => {
        const mockUrl = 'http://example.com';
        const mockHtml = `
      <html>
      <head>
      </head>
      <body></body>
      </html>
    `;

        // Mock the external URL request
        nock(mockUrl)
            .get('/')
            .reply(200, mockHtml);

        const response = await request(app)
            .get(`/api/url/${encodeURIComponent(mockUrl)}`)
            .expect(200);

        expect(response.text).toContain('@online');
        expect(response.text).toContain('url          = {http://example.com}');
    });

    it('should handle errors when the webpage metadata cannot be fetched', async () => {
        const mockUrl = 'http://example.com';

        // Mock an error response
        nock(mockUrl)
            .get('/')
            .replyWithError('Something went wrong');

        await request(app)
            .get(`/api/url/${encodeURIComponent(mockUrl)}`)
            .expect(500);
    });
});

describe('/api/doi/:doi endpoint', () => {

    afterEach(() => {
        nock.cleanAll();
    });

    it('should return a BibTeX entry for a valid DOI', async () => {
        const validDoi = '10.1000/xyz123';
        const mockBibtexResponse = `
      @article{Example2019,
        author = {Author, Example},
        title = {Title of the Example Article},
        journal = {Journal of Examples},
        year = {2019},
        doi = {10.1000/xyz123},
      }
      `;

        // Mock the DOI request
        nock('https://doi.org')
            .get(`/${validDoi}`)
            .reply(200, mockBibtexResponse, {
                'Content-Type': 'application/x-bibtex; charset=utf-8'
            });

        const response = await request(app)
            .get(`/api/doi/${validDoi}`)
            .expect(200);

        // Basic check to ensure response contains expected BibTeX fields
        expect(response.text).toContain('@article{Example2019');
        expect(response.text).toContain('author       = {Author, Example}');
        expect(response.text).toContain('doi          = {10.1000/xyz123}');
    });

    it('should handle errors for invalid or nonexistent DOIs', async () => {
        const invalidDoi = '10.1000/nonexistent';

        // Mock an error response for the invalid DOI
        nock('https://doi.org')
            .get(`/${invalidDoi}`)
            .replyWithError({
                message: 'DOI not found',
                code: 'HTTPError'
            });

        await request(app)
            .get(`/api/doi/${invalidDoi}`)
            .expect(500);
    });
});

describe('/api/isbn/:isbn', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    afterAll(() => {
        nock.cleanAll();
    });

    it('returns a 200 status and a bibtex format for a valid ISBN', async () => {
        const validIsbn = "1234567890000";
        const mockIsbnResponse = {
            [`ISBN:${validIsbn}`]: {
                authors: [{ name: 'John Doe' }],
                title: 'Test Book Title',
                publish_date: '2021',
                publishers: [{ name: 'Test Publisher' }],
                publish_places: [{ name: 'Test Place' }]
            }
        };

        nock('https://openlibrary.org')
            .get(`/api/books?bibkeys=ISBN:${validIsbn}&format=json&jscmd=data`)
            .reply(200, mockIsbnResponse);

        const response = await request(app)
            .get(`/api/isbn/${validIsbn}`)
            .expect(200);

        expect(response.text).toContain('@book{Doe2021');
    });

    it('returns a 200 status and a bibtex format for a valid ISBN with little info', async () => {
        const validIsbn = "1234567890000";
        const mockIsbnResponse = {
            [`ISBN:${validIsbn}`]: {
                authors: [{ name: 'John Doe' }],
                title: 'Test Book Title'
            }
        };

        nock('https://openlibrary.org')
            .get(`/api/books?bibkeys=ISBN:${validIsbn}&format=json&jscmd=data`)
            .reply(200, mockIsbnResponse);

        const response = await request(app)
            .get(`/api/isbn/${validIsbn}`)
            .expect(200);

        expect(response.text).toContain('@book{Doe,');
    });

    it('returns an error message for an ISBN not found', async () => {
        const response = await request(app).get('/api/isbn/invalidISBN');
        expect(response.statusCode).toBe(500);
        expect(response.text).toContain('ISBN not found');
    });
});

describe('POST /api/tidy', () => {
    it('should tidy a BibTeX entry', async () => {
        const bibtexInput = `@article{steward03,
            author =	 {Martha Steward},
            title =	 {Cooking behind bars}, publisher = "Culinary Expert Series",
            year = {2003}
          }
          @Book{impossible,
            Author =	 { Stefan Sweig },
            title =	 { The impossible book },
            publisher =	 { Dead Poet Society},
            year =	 1942,
            month =        mar
          }`;

        const response = await request(app)
            .post('/api/tidy')
            .set('Content-Type', 'text/plain')
            .send(bibtexInput)
            .expect('Content-Type', /text/)
            .expect(200);

        expect(response.text).toContain('title        = {{ The impossible book }},')
        expect(response.text).toContain('year         = 1942,')
        expect(response.text).toContain('publisher    = {Culinary Expert Series}')
    });
});

describe('/ endpoint', () => {

    afterEach(() => {
        nock.cleanAll();
    });

    it('should return a string notifying the user the backend is running properly', async () => {
        const response = await request(app)
            .get('/')
            .expect(200);

        expect(response.text).toContain('I\'m alive!');
    });
});
