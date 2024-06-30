
let vocabularyDB;

loadJSONFromURL(VOCABULAR_DATABASE).then(res => {
    vocabularyDB = res;
    loadLibrary();
})
