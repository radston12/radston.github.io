const vocabulary_view = selectElement(".vocabulary_view");

const sortAlphabeticly = (toSort) => {
    var clone = [...toSort];
    clone.sort(function (a, b) {
        var wordA = a[0].toUpperCase();
        var wordB = b[0].toUpperCase();
        if (wordA < wordB) {
            return -1;
        }
        if (wordA > wordB) {
            return 1;
        }
        return 0;
    });

    return clone;
}

const showCategory = (cat) => {
    const vocabulary = [];

    for (const set of cat.sets) {
        for (const voc of set.vocabulary) vocabulary.push(voc);
    }

    showVocSetInVocabularyView({
        vocabulary
    }, cat, true);
}

const showVocSetInVocabularyView = (set, category, isCategory = false) => {
    vocabulary_view.querySelector("[vocabulary_view=\"table\"]").innerHTML = `<tr vocabulary_view="format"></tr>`;

    vocabulary_view.querySelector("[vocabulary_view=\"title\"]").innerHTML = "Vokabel von " + category.name + (isCategory ? "/*" : "/" + set.name);
    const amount = category.format.names.length;
    const spacing = Math.floor(100 / amount);

    let tr = ``;

    for (let i = 0; i < amount; i++) {
        tr += `<th width="${spacing}%"><text>${category.format.names[i]}</text></th>`;
    }

    vocabulary_view.querySelector("[vocabulary_view=\"format\"]").innerHTML = tr;

    let th = ``;

    const sortedSet = category.format.sortable ? sortAlphabeticly(set.vocabulary) : set.vocabulary;

    for (let voc of sortedSet) {
        th += `<tr>`;
        for (let inVoc of voc) th += `<td>${inVoc}</td>`;
        th += `</tr>`;
    }


    vocabulary_view.querySelector("[vocabulary_view=\"table\"]").innerHTML += th;



    var el = selectElement('[vocabulary_view="train_button"]');
    var elClone = el.cloneNode(true);
    el.parentNode.replaceChild(elClone, el);

    elClone.addEventListener("click", (e) => {
        e.preventDefault();
        trainSet(set, category, isCategory);

        analytics.send("LIBRARY - START", "Set: " + category.name + "/" + set.name);

    })

    MenuManager.showMenu("vocabulary_view");
}

const loadLibrary = () => {
    let catIndex = 0;
    if (rememberdSet.length > 0)
        selectElement(".vocsets").innerHTML = `<div class="vocset" identifyer="##REMEMBER">
            <div class="voc_set_description">
                <div class="count">
                    <div class="count_description">Vokabel</div>
                    <div class="count_value">${rememberdSet.length}</div>
                </div>
                <div class="vocset_name">Gemerkt</div>
                <div class="vocset_author">von dir</div>
            </div>
        </div>`;
    else
        selectElement(".vocsets").innerHTML = "";

    for (const category of vocabularyDB.categorys) {
        let htmlToInject = `<category><text>${category.name}</text><button class="category_button" identifyer="${catIndex}">Kategorie anzeigen</button><hr>`;

        let index = 0;
        for (const set of category.sets) {
            htmlToInject += `<div class="vocset" identifyer="${catIndex}-${index}">
                <div class="voc_set_description">
                    <div class="count">
                        <div class="count_description">Vokabel</div>
                        <div class="count_value">${set.vocabulary.length}</div>
                    </div>
                    <div class="vocset_name">${set.name}</div>
                    <div class="vocset_author">by ${set.author}</div>
                </div>
            </div>`;
            index++;
        }

        htmlToInject += "</category>";
        selectElement(".vocsets").innerHTML += htmlToInject;
        catIndex++;
    }

    for (const set of document.querySelectorAll(".vocset")) {
        set.addEventListener("click", (ev) => {
            const identifyer = set.getAttribute("identifyer").split("-");
            if (identifyer != "##REMEMBER") showVocSetInVocabularyView(vocabularyDB.categorys[identifyer[0]].sets[identifyer[1]], vocabularyDB.categorys[identifyer[0]]);
            else showVocSetInVocabularyView(createRememberdSet(), rememberdCategory);
        })
    };

    for (const set of document.querySelectorAll(".category_button")) {
        set.addEventListener("click", (ev) => {
            const identifyer = set.getAttribute("identifyer");
            showCategory(vocabularyDB.categorys[identifyer]);
        })
    };
};