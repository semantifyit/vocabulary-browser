function getVocabId() {
    const url = window.location.href;
    const pathname = window.location.pathname;
    let mySA = new SDOAdapter();
    let splitURL = pathname.split('/')
    const vocabId = splitURL[1];
    return vocabId;
}