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

        // $('.table-striped').append('<div id="template_tr_error"></div>');
        // $('#external-vocab').append(`<tr id="vocab-${index}"></tr>`);
        // loadHtmlToJqueryElement($('#template_tr_vocab'), '/templateWelcome.html');
        // const html = $('#template_tr_vocab').innerHTML
        //     .replace(/{{{{vocabUrl}}}}/g, vocabUrl)
        //     .replace(/{{vocabId}}/g, vocabId)
        //     .replace(/{{nameofvocab}}/g, nameofvocab)
        // $(`#vocab-${index}`).append(html);

        $('#external-vocab').append(
            template.replace(/{{index}}/g, index)
                .replace(/{{vocabId}}/g, vocabId)
                .replace(/{{nameofvocab}}/g, nameofvocab)
                .replace(/{{vocabUrl}}/g, vocabUrl)
                .replace(/{{author}}/g, authorName || authorEmail)
        );
    });
});


// async function loadHtmlToJqueryElement(jqueryEle, url) {
//     jqueryEle.load(url, function() {
//         res();
//     })
// }