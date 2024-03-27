const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
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

app.get('/api/doi/*', async (req, res) => {
    const doi = req.params[0];
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

        let authors = "unknown";
        let firstAuthorLastName = "unknown";
        if (data.authors && data.authors[0] && data.authors[0].name) {
            authors = data.authors.map(author => author.name).join(" and ");
            firstAuthorLastName = data.authors[0].name.split(" ").pop();
        }
        const title = data.title;
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

app.get('/api/arxiv/:arxivId', async (req, res) => {
    const arxivId = req.params.arxivId;
    const url = `http://export.arxiv.org/api/query?id_list=${arxivId}`;

    try {
        const response = await axios.get(url);
        const parser = new xml2js.Parser();

        parser.parseStringPromise(response.data).then(parsedData => {
            const entry = parsedData.feed.entry[0];
            if (!entry) {
                throw new Error("arXiv ID not found");
            }

            const title = entry.title[0].trim();
            const authors = entry.author.map(author => author.name[0]).join(" and ");
            const year = entry.published[0].substring(0, 4);

            const category = entry.category ? entry.category[0].$.term : 'unknown category';

            const bibtex = `
@article{${arxivId},
    title = "${title}",
    author = "${authors}",
    year = "${year}",
    journal = "arXiv:${arxivId}",
    archivePrefix = "arXiv",
    eprint = "${arxivId}",
    primaryClass = "${category}",
    url = "https://arxiv.org/abs/${arxivId}"
}
            `;

            res.send(bibtexTidy(bibtex)["bibtex"]);
        }).catch(err => {
            throw err;
        });
    } catch (error) {
        console.error("Error fetching arXiv data:", error);
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
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`Listening on port ${PORT}`))
}

module.exports = app;
