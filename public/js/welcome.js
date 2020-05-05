$("#header").load("/header.html");
$.getJSON("vocabs.json", function(data) {
    let dataset = data[0]['schema:dataset'];
    dataset.forEach((set, index) => {
        let nameofvocab = [set][0]['schema:name'];
        let vocabUrl = [set][0]['schema:url'];
        let authorName = [set][0]['schema:author']['schema:name'];
        let authorEmail = [set][0]['schema:author']['schema:email'];
        let splitURL = vocabUrl.split('/');
        let vocabId = splitURL[4];
        $('#external-vocab').append(`<tr id="vocab-${index}"></tr>`)
            //        $(`#vocab-${index}`).load("templateWelcome.html");
        $.get("templateWelcome.html", (data) => {
            nameofvocab = data.replace(/{{nameofvocab}}/g, nameofvocab);
            vocabId = data.replace(/{{vocabId}}/g, vocabId);
            vocabUrl = data.replace(/{{vocabUrl}}/g, vocabUrl);
            authorName = data.replace(/{{authorName}}/g, authorName);
            authorEmail = data.replace(/{{authorEmail}}/g, authorEmail);


            $(`#vocab-${index}`).html(nameofvocab);

            //            $(`#vocab-${index}`).html(abc.vocabUrl);
            //          $(`#vocab-${index}`).html(abc.authorName);
            //        $(`#vocab-${index}`).html(abc.authorEmail);
        });

    });
});