$("#header").load("header.html");

$.getJSON("vocabs.JSON", function(data) {
    let dataset = data[0]['schema:dataset'];
    dataset.forEach((set, index) => {
        let nameofvocab = [set][0]['schema:name'];
        let vocabUrl = [set][0]['schema:url'];
        let authorName = [set][0]['schema:author']['schema:name'];
        let authorEmail = [set][0]['schema:author']['schema:email'];
        let splitURL = vocabUrl.split('/');
        let vocabId = splitURL[4];
        $('#external-vocab').append(`<tr id="vocab-${index}"></tr>`);
        $(`#vocab-${index}`).append(`<td><a class="nameofvocab" href="./${vocabId}">${nameofvocab}</a></td>`);
        $(`#vocab-${index}`).append(`<td><a href="${vocabUrl}" target="_blank">${vocabUrl}</a></td>`);
        if (authorName) {
            $(`#vocab-${index}`).append(`<td>${authorName}</td>`);
        } else {
            $(`#vocab-${index}`).append(`<td>${authorEmail}</td>`);
        }
    });
});

$(document).delegate('.nameofvocab', 'click', function(e) {
    e.preventDefault();
    let vocabularyName = $(this).text();
    localStorage.setItem("vocab", vocabularyName);
    window.location.href = $(this).attr('href');
});