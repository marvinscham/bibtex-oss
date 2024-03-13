const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const tidy = require('bibtex-tidy');

const app = express();
app.use(express.text())
app.disable("x-powered-by");

function bibtexTidy(bibtex) {
    return tidy.tidy(bibtex, {
        curly: true,
        numeric: true,
        tab: true,
        align: 13,
        duplicates: "key",
        sortFields: true,
        removeEmptyFields: true,
        enclosingBraces: ["title"]
    });
}

app.get('/api/url/:url', async (req, res) => {
    const url = req.params.url;

    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);

        const json_ld = JSON.parse($('script[type="application/ld+json"]').text() || "{}");

        let urldate = new Date();
        urldate = urldate.toISOString().split('T')[0];

        let year = '';
        let month = '';
        const dateString =
            json_ld?.datePublished ||
            $('meta[property="article:published_time"]').attr('content');
        if (dateString) {
            year = new Date(dateString).getFullYear();
            month = new Date(dateString).toLocaleString('en-us', { month: 'short' }).toLowerCase();
        }

        const author =
            json_ld?.author?.name ||
            $('meta[name="author"]').attr('content') ||
            $('meta[name="twitter:data1"]').attr('content') ||
            '';
        const title =
            json_ld?.headline ||
            $('meta[name="og:title"]').attr('content') ||
            $('meta[name="title"]').attr('content') ||
            $('head title').text() ||
            '';

        let identifier = createIdentifier(url, year);

        const bibtex = `
        @online{${identifier},
            author = {${author}},
            title = {${title}},
            url = {${url}},
            month = {${month}},
            year = {${year}},
            urldate = {${urldate}}
        }`;

        res.send(bibtexTidy(bibtex)["bibtex"]);
    } catch (error) {
        console.error("Error fetching webpage metadata:", error);
        res.status(500).send(error.toString());
    }
});

function createIdentifier(url, year) {
    const parts = (new URL(url)).hostname.split('.');
    const transformedParts = parts.map((part, index) => {
        return part.charAt(0).toUpperCase() + part.slice(1);
    });
    return transformedParts.join('') + year;
}

app.get('/api/doi/:doi', async (req, res) => {
    const doi = req.params.doi;
    const url = `https://doi.org/${doi}`;

    try {
        const response = await axios.get(url, {
            headers: {
                "Accept": "application/x-bibtex; charset=utf-8",
            },
            responseType: 'text'
        });

        res.send(bibtexTidy(response.data)["bibtex"]);
    } catch (error) {
        console.error("Error fetching DOI data:", error);
        res.status(500).send(error.toString());
    }
});

app.get('/api/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

    try {
        const response = await axios.get(url);
        const data = response.data[`ISBN:${isbn}`];
        if (!data) {
            throw new Error("ISBN not found");
        }

        let authors = "";
        if (data.authors && data.authors[0] && data.authors[0].name) {
            authors = data.authors.map(author => author.name).join(" and ");
        }
        const title = data.title;
        const firstAuthorLastName = data.authors[0].name.split(" ").pop();
        const year = data.publish_date ? data.publish_date : '';
        const publisher = data.publishers ? data.publishers[0].name : '';
        const address = data.publish_places ? data.publish_places[0].name : '';

        const bibtex = `
    @book{${firstAuthorLastName}${year},
        title     = "${title}",
        author    = "${authors}",
        publisher = "${publisher}",
        year      = "${year}",
        address   = "${address}",
        isbn      = "${isbn}"
    }
        `;

        res.send(bibtexTidy(bibtex)["bibtex"]);
    } catch (error) {
        console.error("Error fetching ISBN data:", error);
        res.status(500).send(error.toString());
    }
});

app.post('/api/tidy', (req, res) => {
    res.send(bibtexTidy(req.body)["bibtex"]);
});

app.get('/', (req, res) => {
    res.send("I'm alive!");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
