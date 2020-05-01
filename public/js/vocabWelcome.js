$(document).ready(function() {
    let mySA = new SDOAdapter();
    let externalVocabURL = "https://semantify.it/voc/" + getVocabId();
    let vocabId = getVocabId();
    let vocabularyName = localStorage.getItem("vocab");

    mySA.constructSDOVocabularyURL('7.04', 'all-layers').then(function(sdoURL) {
        mySA.addVocabularies([sdoURL, externalVocabURL]).then(function() {
            $('#loading').hide();
            let propertiesinVocab;
            const vocabcheck = mySA.getVocabularies(externalVocabURL);
            delete vocabcheck['schema'];
            const VocabValue = Object.values(vocabcheck);
            const VocabName = Object.keys(vocabcheck); // todo get name of key dynamically
            let classesinVocab = mySA.getListOfClasses({ fromVocabulary: VocabName }); //todo each VocabName
            propertiesinVocab = mySA.getAllProperties({ fromVocabulary: VocabName });
            let allProps = mySA.getListOfProperties({ fromVocabulary: VocabName })

            let allEnumerations = mySA.getListOfEnumerations();
            let enumerationsInVocab = allEnumerations.filter(function(item) {
                return item.indexOf("schema:") !== 0;
            });

            $('#vocabName').append(`${vocabularyName}  (${VocabName})`);
            let NoofClasses = classesinVocab.length;
            if (NoofClasses > 0) {
                $('#NoofClasses').append(`${NoofClasses} Classes`);
                // $('.definition-table').append(`<thead><tr><th>New classes</th>
                // <th>New properties for class</th></tr></thead><tbody id="classesProps"></tbody>`);
                listClasses(classesinVocab);
            } else {
                $('#NoofClasses').append("No classes found");
            }
            let NoofProps = propertiesinVocab.length;
            if (NoofProps > 0) {
                $('#NoofProps').append(`${NoofProps} Properties`);
                listProperties(allProps);
            } else {
                $('#NoofProps').append("No properties found");
            }
            let NoofEnu = enumerationsInVocab.length;
            if (NoofEnu > 0) {
                $('#NoofEnu').append(`${NoofEnu} Enumerations`);
            } else {
                $('#NoofEnu').append(`No enumerations found`);
            }

            classesinVocab.forEach(function(vocabClass, index) {
                let className = mySA.getClass(vocabClass);
                let vocabProps = className.getProperties(false);
                vocabProps.forEach(function(vocabProp) {
                    //this will add all <a> properties of each class inside one td with <br>
                    let property = mySA.getProperty(vocabProp);
                    $(`#property${index}`).append(`<a href="/${vocabId}/${vocabProp}">${vocabProp}</a> <br>`);
                });
            });
        })
    })

    function listProperties(allProps) {
        allProps.forEach(function(prop) {
            $('#listofProps').append(`<li> <a href="/${vocabId}/${prop}">${prop}</a> </li>`);
        });
    }

    function listClasses(allClasses) {
        allClasses.forEach(function(oneClass) {
            $('#listofClasses').append(`<li> <a href="/${vocabId}/${oneClass}">${oneClass}</a> </li>`);
        });
    }
})