const selectElement = (query) => {
    return document.querySelector(query);
}

const loadJSONFromURL = (url) => {
    return new Promise(
        (res) => fetch(url)
            .then(
                    (content) => content.text()
                )
            .then(
                (text) => res(JSON.parse(text))
                )
    );
}

const clearStorage = (SAVE_NAME = "currentTraining") => {
    localStorage.removeItem(SAVE_NAME);
}
