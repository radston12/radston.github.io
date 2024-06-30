let rememberdSet = [];

const rememberdCategory = {
    name: "Privat",
    format: {
        questions: [1, 2],
        questions_str: ["Wie lautet die grammatische Kennzeichnung <br> von", "Wie lautet das deutsche Wort <br> von"],
        result_str: "Wusstest du was richtig war?",
        names: ["Latein", "grammatische Kennzeichnung", "Deutsch"],
        sortable: true
    },
}

const createRememberdSet = () => {
    return {
        name: "Gemerkt",
        author: "dir",
        vocabulary: rememberdSet
    }
}

const addRememberd = (voc) => {
    rememberdSet.push(voc);
    let vocString;
    for (const a of voc) vocString += a + " <-> ";
    analytics.send("Remember - ADD", "Vocabulary: " + vocString);
}

const removeRemeberd = (voc) => {
    let newArray = [];

    for (const check of rememberdSet) {
        let isCorrect = true;
        for (var i = 0; i < Math.min(check.length, voc.length); i++) {
            if (!(check[i] == voc[i])) {
                isCorrect = false;
                break;
            }
        }
        if (!isCorrect) newArray.push(check);
    }


    let vocString;
    for (const a of voc) vocString += a + " <-> ";
    analytics.send("Remember - REMOVE", "Vocabulary: " + vocString);

    rememberdSet = newArray;
}

const isRemeberd = (voc) => {
    for (const check of rememberdSet) {
        let isCorrect = true;
        for (var i = 0; i < Math.min(check.length, voc.length); i++) {
            if (!(check[i] == voc[i])) {
                isCorrect = false;
                break;
            }
        }
        if (isCorrect) return true;
    }

    return false;
}

const initRemember = (element, callback, getVocabular) => {
    element.addEventListener("click", () => {
        if (!isRemeberd(getVocabular()))
            addRememberd(getVocabular());
        else
            removeRemeberd(getVocabular());

        callback();

        setTimeout(saveRemember, 0);
    });
}


const saveRemember = (SAVE_NAME = "remember") => {
    localStorage.setItem(SAVE_NAME, JSON.stringify(rememberdSet));
    loadLibrary();
}

const loadRemember = (SAVE_NAME = "remember") => {
    rememberdSet = JSON.parse(localStorage.getItem(SAVE_NAME));
    if (!rememberdSet) rememberdSet = [];
    if (vocabularyDB) loadLibrary();
}

const clearRemember = (SAVE_NAME = "remember") => {
    localStorage.setItem(SAVE_NAME, undefined);
}

loadRemember();