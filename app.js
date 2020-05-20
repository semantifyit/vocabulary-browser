const express = require('express');
const morgan = require('morgan');
const request = require('request-promise-native');
const rdfTranslator = require('rdf-translator');
const jsonld = require('jsonld');

const app = express();
app.use(morgan('combined'))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/lib/schema-org-adapter.min.js', express.static(__dirname + '/node_modules/schema-org-adapter/dist/schema-org-adapter.min.js')); //sdo library
app.use(express.static('public'));
const node_modules_path = require.resolve('express').split('express')[0].slice(0, -1);
app.use('/libs/jquery', express.static(node_modules_path + '/jquery/dist/'));
app.use('/libs/bootstrap', express.static(node_modules_path + '/bootstrap/dist/'));
app.use('/libs/schema-org-adapter', express.static(node_modules_path + '/schema-org-adapter/dist/'));


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/welcome.html');
});

app.get('/:vocabId', (req, res) => {
    res.format({
        'application/ld+json': async() => {
            try {
                let uri = `https://semantify.it/voc/${req.params.vocabId}`;
                let response = await request(uri);
                res.send(response);
            } catch (e) { res.status(400).send(e) }
        },
        'application/rdf+xml': async() => {
            try {
                let uri = `https://semantify.it/voc/${req.params.vocabId}`;
                let nTriple = await renderNtriple(uri);
                const data = await rdfTranslator(nTriple, 'n3', 'xml');
                res.send(data);
            } catch (e) { res.status(400).send(e) }
        },
        'application/n-triples': async() => {
            try {
                let uri = `https://semantify.it/voc/${req.params.vocabId}`;
                let nTriple = await renderRDF(uri);
                res.send(nTriple);
            } catch (e) { res.status(400).send(e) }
        },
        'application/x-turtle': async() => {
            try {
                let uri = `https://semantify.it/voc/${req.params.vocabId}`;
                let turtle = await renderRDF(uri);
                res.send(turtle);
            } catch (e) { res.status(400).send(e) }
        },
        'application/n3': async() => {
            try {
                let uri = `https://semantify.it/voc/${req.params.vocabId}`;
                let nThree = await renderRDF(uri);
                res.send(nThree);
            } catch (e) { res.status(400).send(e) }
        },
        'text/html': () => {
            res.sendFile(__dirname + '/public/vocabWelcome.html');
        },
        default: () => {
            res.sendFile(__dirname + '/public/vocabWelcome.html');
        }
    })
});

app.get('/vsearch/vsearch.rdf', (req, res) => {
    res.sendFile(__dirname + '/vsearch/vsearch.rdf');
});
// on /112
// click on href with ./Trail
// goto /112/Trail

app.get('/*', (req, res) => {
    res.sendFile(__dirname + '/public/vocabTerm.html');
});

async function renderNtriple(uri) {
    let nquads;
    let body = await request(uri);
    let jsonBody = JSON.parse(body);
    delete jsonBody['@id'];
    nquads = await jsonld.toRDF(jsonBody, { format: 'application/n-quads' });
    return nquads;
}

async function renderRDF(uri) {
    let nquads = await renderNtriple(uri);
    return nquads;
}

app.listen(process.env.PORT || 8080,
    () => console.log(`Listening on port ${process.env.PORT || 8080}!`));