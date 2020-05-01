function getVocabId() {
    const pathname = window.location.pathname;
    let splitURL = pathname.split('/')
    const vocabId = splitURL[1];
    return vocabId;
}