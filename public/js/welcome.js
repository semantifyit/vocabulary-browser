$(document).ready(async() => {
    $("#header").load("/header.html");
    const json = await $.getJSON("/vocabs.JSON");
    let dataset = json[0]['schema:dataset'];
    let template = await $.get('/templateWelcome.html');

    dataset.forEach((set, index) => {
        let nameofvocab = [set][0]['schema:name'];
        let vocabUrl = [set][0]['schema:url'];
        let authorName = [set][0]['schema:author']['schema:name'];
        let authorEmail = [set][0]['schema:author']['schema:email'];
        let splitURL = vocabUrl.split('/');
        let vocabId = splitURL[4];

        $('#external-vocab').append(
            template.replace(/{{index}}/g, index)
            .replace(/{{vocabId}}/g, vocabId)
            .replace(/{{nameofvocab}}/g, nameofvocab)
            .replace(/{{vocabUrl}}/g, vocabUrl)
            .replace(/{{author}}/g, authorName || authorEmail)
        );
    });
});