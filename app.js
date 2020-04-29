const express = require('express');

const app = express();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/lib/schema-org-adapter.min.js', express.static(__dirname + '/node_modules/schema-org-adapter/dist/schema-org-adapter.min.js')); //sdo library
app.use(express.static('public'));

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