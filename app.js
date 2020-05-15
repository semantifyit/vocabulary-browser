const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('combined'))
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/lib/schema-org-adapter.min.js', express.static(__dirname + '/node_modules/schema-org-adapter/dist/schema-org-adapter.min.js')); //sdo library
app.use(express.static('public'));
//Hello
const node_modules_path = require.resolve('express').split('express')[0].slice(0, -1);
app.use('/libs/jquery', express.static(node_modules_path + '/jquery/dist/'));
app.use('/libs/bootstrap', express.static(node_modules_path + '/bootstrap/dist/'));
app.use('/libs/schema-org-adapter', express.static(node_modules_path + '/schema-org-adapter/dist/'));


app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/public/index.html');
    res.sendFile(__dirname + '/public/welcome.html');
});

app.get('/:vocabId', (req, res) => {
    //res.sendFile(__dirname + '/public/index.html');
    res.sendFile(__dirname + '/public/vocabWelcome.html');
});

// on /112
// click on href with ./Trail
// goto /112/Trail

app.get('/*', (req, res) => {

    res.sendFile(__dirname + '/public/vocabTerm.html');
    //    res.sendFile(__dirname + '/public/welcome.html');

});

app.listen(process.env.PORT || 8080,
    () => console.log(`Listening on port ${process.env.PORT || 8080}!`));