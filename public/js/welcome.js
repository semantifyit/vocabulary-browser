$(document).ready(async() => {
    $("#header").load("/header.html");
    const json = await $.getJSON("/vocabs.JSON");
    let dataset = json[0]['schema:dataset'];
    let template = await $.get('/templateWelcome.html');

    let vocabularyDesc = '';

    dataset.forEach((set, index) => {
        let nameofvocab = [set][0]['schema:name'];
        let vocabUrl = [set][0]['schema:url'];
        let authorName = [set][0]['schema:author']['schema:name'];
        let authorEmail = [set][0]['schema:author']['schema:email'];

        let additionalProperty = [set][0]['schema:additionalProperty'];
        let classesInJson = '';
        let propertiesInJson = '';
        if (additionalProperty) {
            for (let i = 0; i < additionalProperty.length; i++) {
                if (additionalProperty[i]["schema:name"]) {
                    if (additionalProperty[i]["schema:name"] === "Classes") {
                        classesInJson = `<br> <b>Summary:</b> ${additionalProperty[i]["schema:value"]} Classes,`
                    } else if (additionalProperty[i]["schema:name"] === "Properties") {
                        propertiesInJson = `${additionalProperty[i]["schema:value"]} Properties`
                    }
                }
            }
        }
        if ([set][0]['schema:description']) {
            vocabularyDesc = [set][0]['schema:description']
        } else {
            vocabularyDesc = '';
        }

        let splitURL = vocabUrl.split('/');
        let vocabId = splitURL[4];

        $('#external-vocab').append(
            template.replace(/{{index}}/g, index)
            .replace(/{{vocabId}}/g, vocabId)
            .replace(/{{nameofvocab}}/g, nameofvocab)
            .replace(/{{vocabUrl}}/g, vocabUrl)
            .replace(/{{author}}/g, authorName || authorEmail)
            .replace(/{{vocabularyDesc}}/g, vocabularyDesc)
            .replace(/{{classesInJson}}/g, classesInJson)
            .replace(/{{propertiesInJson}}/g, propertiesInJson)
        );
    });
});