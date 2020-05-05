$(document).ready(async() => {
    $("#header").load("/header.html");
    let mySA = new SDOAdapter();
    let externalVocabURL = "https://semantify.it/voc/" + getVocabId();
    let vocabId = getVocabId();

    let vocabularyName = '';

    $.getJSON("vocabs.JSON", function(data) {
        let dataset = data[0]['schema:dataset'];
        dataset.forEach((set) => {
            let vocabUrl = [set][0]['schema:url'];
            if (vocabUrl === externalVocabURL) {
                vocabularyName = [set][0]['schema:name'];
            }
        });
    });

    sdoURL = await mySA.constructSDOVocabularyURL('latest', 'all-layers');
    await mySA.addVocabularies([sdoURL, externalVocabURL]);
    $('#loading').hide();
    let propertiesinVocab;
    const vocabcheck = mySA.getVocabularies(externalVocabURL);
    delete vocabcheck['schema'];
    const VocabName = Object.keys(vocabcheck);
    let classesinVocab = mySA.getListOfClasses({ fromVocabulary: VocabName });
    propertiesinVocab = mySA.getAllProperties({ fromVocabulary: VocabName });
    let allProps = mySA.getListOfProperties({ fromVocabulary: VocabName })
    let allEnumerations = mySA.getListOfEnumerations();
    let enumerationsInVocab = allEnumerations.filter(function(item) {
        return item.indexOf("schema:") !== 0;
    });
    $('#vocabName').append(`${vocabularyName}  (${VocabName})`);
    let noOfClasses = classesinVocab.length;
    if (noOfClasses > 0) {
        $('#noOfClasses').append(`${noOfClasses} Classes`);
        listClasses(classesinVocab);
    } else {
        $('#noOfClasses').append("No classes found");
    }
    let noOfProps = propertiesinVocab.length;
    if (noOfProps > 0) {
        $('#noOfProps').append(`${noOfProps} Properties`);
        listProperties(allProps);
    } else {
        $('#noOfProps').append("No properties found");
    }
    let noOfEnu = enumerationsInVocab.length;
    if (noOfEnu > 0) {
        $('#noOfEnu').append(`${noOfEnu} Enumerations`);
    } else {
        $('#noOfEnu').append(`No enumerations found`);
    }
    classesinVocab.forEach((vocabClass, index) => {
        let className = mySA.getClass(vocabClass);
        let vocabProps = className.getProperties(false);
        vocabProps.forEach((vocabProp) => {
            //  Add all <a> properties of each class inside one td with <br>
            $(`#property${index}`).append(`<a href="/${vocabId}/${vocabProp}">${vocabProp}</a> <br>`);
        });
    });

    function listProperties(allProps) {
        //        return new Promise(allProps) = > {}
        allProps.forEach((prop) => {
            $('#listofProps').append(`<li> <a href="/${vocabId}/${prop}">${prop}</a> </li>`);
        });
    }

    function listClasses(allClasses) {
        allClasses.forEach((oneClass) => {
            $('#listofClasses').append(`<li> <a href="/${vocabId}/${oneClass}">${oneClass}</a> </li>`);
        });
    }
})