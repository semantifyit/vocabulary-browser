$(document).ready(async() => {
    $("#header").load("/header.html");
    const pathname = window.location.pathname;
    let mySA = new SDOAdapter();
    let splitURL = pathname.split('/');
    const vocabId = getVocabId();
    const term = splitURL[2];
    let externalVocabURL = "https://semantify.it/voc/" + vocabId;
    let currentVocab;

    sdoURL = await mySA.constructSDOVocabularyURL('latest', 'all-layers');
    await mySA.addVocabularies([sdoURL, externalVocabURL]);
    $('#loading').hide();
    let termTest;
    let isproperty = false;
    let isclass = false;
    let isEnumerationMember = false;
    try {
        termTest = mySA.getProperty(term);
        isproperty = true;
        currentVocab = termTest.getVocabulary();
    } catch (e) {}
    try {
        termTest = mySA.getClass(term);
        isclass = true;
        currentVocab = termTest.getVocabulary();
    } catch (e) {}
    try {
        termTest = mySA.getEnumerationMember(term);
        isEnumerationMember = true;
        currentVocab = termTest.getVocabulary();
    } catch (e) {}
    if (isclass) {
        $('#termClass').show();
        createClassPage(termTest);
    }
    if (isproperty) {
        $('#termProperty').show();
        await createPropertyPage(termTest);
    }
    if (isEnumerationMember) {
        $('#termClass').show();
        let enuMemberDomain = termTest.getDomainEnumerations(); // string[]
        let enumClass = mySA.getEnumeration(enuMemberDomain[0]);
        createClassPage(enumClass, termTest); //(Enum, EnumMember)
    }

    var superProp;
    var propSuperVocab;
    var propSub;
    var propSubVocab;
    var propSuperProp;
    var propSubProp;
    var domainCellItemsArray = [];
    var rangeCellItemsArray = [];

    async function createPropertyPage(termTest) {
        let NameofProp;
        NameofProp = termTest.getName();
        $("h1.page-title").text(NameofProp);

        let termType = termTest.getTermType();
        let ClassNameOfProp = termType.replace("rdf:", "");

        let NameofClassProp = mySA.getClass(ClassNameOfProp);

        let superClassofprop = NameofClassProp.getSuperClasses(true);
        superClassofprop.reverse();
        superClassofprop.push(ClassNameOfProp);
        superClassofprop.push(NameofProp);

        let breadCrum = await makeBreadCrum(superClassofprop);
        $('.breadcrumbs').append(breadCrum);
        let resource = termTest.getIRI();
        $('#mainContent').attr('typeof', termType);
        $('#mainContent').attr('resource', resource);
        let propDesc = termTest.getDescription();
        $('div[property*="rdfs:comment"]').text(propDesc);
        let DefTableHTML = await makeDefTable(termTest);
        $('#termProperty').append(
            DefTableHTML
            .replace(/{{rangeCellItemsArray}}/g, rangeCellItemsArray.join('<br>'))
            .replace(/{{domainCellItemsArray}}/g, domainCellItemsArray.join('<br>'))
            .replace(/{{propSuperVocab}}/g, propSuperVocab)
            .replace(/{{superProp}}/g, superProp)
            .replace(/{{propSuperProp}}/g, propSuperProp)
            .replace(/{{propSubVocab}}/g, propSubVocab)
            .replace(/{{propSub}}/g, propSub)
            .replace(/{{vocabId}}/g, vocabId)
            .replace(/{{propSubProp}}/g, propSubProp)
        );
    }

    async function makeDefTable(termTest) { // property id as string

        let propRange = termTest.getRanges(false);
        let propDomain = termTest.getDomains(false);
        propSuperProp = termTest.getSuperProperties();
        propSubProp = termTest.getSubProperties(false);

        propSuperProp.forEach((propSuper) => {
            superProp = propSuper.replace('schema:', '');
            let superPropName = mySA.getProperty(propSuper);
            propSuperVocab = superPropName.getVocabulary();
        });
        propSubProp.forEach((subProp) => {
            propSub = subProp.replace('schema:', '');
            let subPropName = mySA.getProperty(subProp);
            propSubVocab = subPropName.getVocabulary();
        });
        var rangeCellItems = [];
        propRange.forEach((propRange) => {
            rangeCellItems.push(makeRangeCell(propRange));
        });
        rangeCellItemsArray = rangeCellItems;
        var domainCellItems = [];
        propDomain.forEach((propDom) => {
            domainCellItems.push(makeDomainCell(propDom));
        });
        domainCellItemsArray = domainCellItems;

        let DefTableHTML = "";
        let templateTableRange = await $.get('/templateTableRange.html');
        let templateTableDomain = await $.get('/templateTableDomain.html');
        let tempSupPropSDOvocab = await $.get('/tempSupPropSDOvocab.html');
        let tempSupPropSameVocab = await $.get('/tempSupPropSameVocab.html');
        let tempSubPropSDOvocab = await $.get('/tempSubPropSDOvocab.html');
        let tempSubPropSameVocab = await $.get('/tempSubPropSameVocab.html');

        if (propRange.length > 0) {
            DefTableHTML = DefTableHTML + templateTableRange;
        }
        if (propDomain.length > 0) {
            DefTableHTML = DefTableHTML + templateTableDomain;
        }
        if (propSuperProp.length > 0) {
            if (propSuperVocab !== currentVocab) {
                DefTableHTML = DefTableHTML + tempSupPropSDOvocab;
            }
            if (propSuperVocab === currentVocab) {
                DefTableHTML = DefTableHTML + tempSupPropSameVocab;
            }
        }
        if (propSubProp.length > 0) {
            if (propSubVocab !== currentVocab) {
                DefTableHTML = DefTableHTML + tempSubPropSDOvocab;
            }
            if (propSubVocab === currentVocab) {
                DefTableHTML = DefTableHTML + tempSubPropSameVocab;

            }
        }
        return DefTableHTML;
    }

    function fetchEnumerationMembers(term) {

        let EnuClass = mySA.getEnumeration(term);
        let EnuMembers = EnuClass.getEnumerationMembers();

        let EnumMemberDomains = [];
        EnuMembers.forEach((enumember) => {
            console.log(EnumMemberDomains);
            let EnuMemberClass = mySA.getEnumerationMember(enumember)
            EnumMemberDomains.push(EnuMemberClass.getDomainEnumerations());
        });
        return EnuMembers;
    };

    async function createClassPage(termTest, enumerationMember) {
        let termIRI = termTest.getIRI(true);
        let NameofClass;
        if (enumerationMember) {
            NameofClass = enumerationMember.getName();
            $("h1.page-title").text(NameofClass);
        } else {
            NameofClass = termTest.getName();
            $("h1.page-title").text(NameofClass);
        }
        let superClasses;
        if (enumerationMember) {
            superClasses = termTest.getSuperClasses(true);
        } else {
            superClasses = termTest.getSuperClasses(true);
            let checkEnumeration = superClasses.includes('schema:Enumeration');
            let EnuMemberfunc;
            if (checkEnumeration) {
                EnuMemberfunc = fetchEnumerationMembers(termIRI);
                $('#termClass').append(`<br><div id="EnuMembers"><a href="#EnuMembers">Enumeration members <br> </a> <ul id="listEnuMembers"></ul></div>`);
                EnuMemberfunc.forEach((member) => {
                    $('#listEnuMembers').append(`<li><a href="/${vocabId}/${member}">${member}</a></li>`);
                });
            }
        }

        superClasses.reverse();

        superClasses.push(termIRI);

        superClasses.reverse();
        superClasses.forEach((superclass, index) => {
            let term = mySA.getClass(superclass);
            let props = term.getProperties(false);
            // Create tbody for class
            let generatedTbody = makeClassBody(term, superclass, index);
            // Add all classes in tbody 
            $('#classes-table').append(generatedTbody);
            props.forEach((prop) => {
                let generatedHTML = makeProperty(prop);
                $('#sup-class-props' + index).append(generatedHTML);
            });
        });

        superClasses.reverse();

        if (enumerationMember) {
            superClasses.push(term);
        }

        let breadCrum = makeBreadCrum(superClasses, enumerationMember);
        $('.breadcrumbs').append(breadCrum);

        let termType = termTest.getTermType();
        $('#mainContent').attr('typeof', termType);
        if (enumerationMember) {
            let classDesc = enumerationMember.getDescription();
            $('div[property*="rdfs:comment"]').text(classDesc);
        } else {
            let classDesc = termTest.getDescription();
            $('div[property*="rdfs:comment"]').text(classDesc);
        }
        $("span.supertype-name").text(NameofClass);
    }

    function makeBreadCrum(superClasses, enumerationMember) {
        let superClassesArray = [];
        superClasses.forEach((superClass) => {
            superClassesArray.push(makeCrumCell(superClass));
        });
        let breadcrumHTML;

        if (enumerationMember) {
            breadcrumHTML = superClassesArray.reduce((text, value, i, array) => text + (i < array.length - 1 ? ' > ' : ' :: ') + value);
        } else {
            breadcrumHTML = `${superClassesArray.join(' > ')}`;
        }
        return breadcrumHTML;
    }

    function makeCrumCell(superClass) {
        let crumProp;
        let IRIcheck;
        try {
            let crumClass;
            try {
                crumClass = mySA.getClass(superClass);
            } catch {}
            try {
                crumClass = mySA.getDataType(superClass);
            } catch {}
            try {
                crumClass = mySA.getEnumerationMember(superClass);
            } catch {}
            let crumClassIRI = crumClass.getIRI();
            IRIcheck = crumClassIRI.includes("schema.org");
            let newSupClass = superClass.replace('schema:', '');
            if (IRIcheck) {
                return `<a href="http://schema.org/${newSupClass}" class="outgoingLinkRed" target="_blank">${newSupClass}</a>`
            } else {
                return `<a href="/${vocabId}/${newSupClass}">${newSupClass}</a>`
            }
        } catch (e) {}
        try {
            crumProp = mySA.getProperty(superClass);
            let crumPropIRI = crumProp.getIRI();
            IRIcheck = crumPropIRI.includes("schema.org");
            let newSupClass = superClass.replace('schema:', '');
            if (IRIcheck) {
                return `<a href="http://schema.org/${superClass}" class="outgoingLinkRed" target="_blank">${newSupClass}</a>`
            } else {
                return `<a href="/${vocabId}/${term}">${term}</a>`
            }
        } catch (e) {}
    }

    function makeClassBody(term, superclass, index) {
        const classVocab = term.getVocabulary();
        let removedSchema = superclass.replace('schema:', '');
        let tbody;
        if (classVocab !== currentVocab) {
            tbody = `<tbody id="sup-class-props${index}"><tr class="supertype">
    <th class="supertype-name" colspan="3">Properties from <a href="${classVocab}/${term.getName()}" class="outgoingLinkRed" target="_blank">${removedSchema}</a></th></tr>
</tbody>`
        } else {
            tbody = `<tbody id="sup-class-props${index}"><tr class="supertype">
    <th class="supertype-name" colspan="3">Properties from <a href="/${vocabId}/${superclass}" >${superclass}</a></th></tr>
</tbody>`
        }
        return tbody;
    }

    function makeProperty(property) { // property id as string

        let testProperty = mySA.getProperty(property);
        let propRanges = testProperty.getRanges(false);
        let propDesc = testProperty.getDescription();
        var rangeCellItems = [];
        propRanges.forEach((propRange) => {
            rangeCellItems.push(makeRangeCell(propRange));
        });

        let propVocab = testProperty.getVocabulary();
        let prop = property.replace('schema:', '');

        let html;
        if (propVocab !== currentVocab) {
            html = `<tr typeof="rdfs:Property" resource="${propVocab}/${prop}">
    <th class="prop-nam" scope="row">
      <code property="rdfs:label"><a property="rdfs:label" href="${propVocab}/${prop}" class="outgoingLinkRed" target="_blank">${prop}</a></code>
    </th><td class="prop-ect">${rangeCellItems.join('&nbsp; or <br/>')}
    </td><td class="prop-desc" property="rdfs:comment">${propDesc}</td></tr>`
        } else {
            html = `<tr typeof="rdfs:Property" resource="http://dachkg.org/ontology/1.0/${prop}">
    <th class="prop-nam" scope="row"><code property="rdfs:label"><a property="rdfs:label" href="/${vocabId}/${prop}" >${property}</a></code>
    </th>
    <td class="prop-ect">
        ${rangeCellItems.join('&nbsp; or <br/>')}
    </td>
    <td class="prop-desc" property="rdfs:comment">${propDesc}</td>
  </tr>`
        }
        return html;
    }

    function makeRangeCell(range) {
        let rangeClassName;
        try {
            rangeClassName = mySA.getClass(range);
        } catch (e) {}
        try {
            rangeClassName = mySA.getDataType(range);
        } catch (e) {}
        let rangeClassIRI = rangeClassName.getIRI();
        let IRIcheck = rangeClassIRI.includes("schema.org")
        let rangeVocab = range.replace('schema:', '');
        if (IRIcheck == true) {
            return `<a property="rangeIncludes" href="http://schema.org/${rangeVocab}" class="outgoingLinkRed" target="_blank">${rangeVocab}</a>`
        } else {
            return `<a property="domainIncludes" href="/${vocabId}/${rangeVocab}" >${range}</a>`
        }
    }

    function makeDomainCell(domain) {
        let domainName = mySA.getClass(domain);
        let propDomVocab = domainName.getVocabulary();

        let domainVocab = domain.replace('schema:', '');

        if (propDomVocab !== currentVocab) {
            return `<a property="domainIncludes" href="${propDomVocab}/${domainVocab}" class="outgoingLinkRed" target="_blank">${domainVocab}</a>`
        }
        if (propDomVocab === currentVocab) {
            return `<a property="domainIncludes" href="/${vocabId}/${domain}" >${domain}</a>`
        }
    }
})