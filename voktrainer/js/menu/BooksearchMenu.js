class BooksearchMenu extends Menu {

    #results = selectElement(".booksearch_results");
    #search = selectElement("input")

    #booksearchUI = {
        results: selectElement(".booksearch_results"),
        exactType: document.querySelectorAll(".booksearchbar--text > p")[0],
        searchType: document.querySelectorAll(".booksearchbar--text > p")[1],
        found: document.querySelectorAll(".booksearchbar--text > p")[2],
        shown: document.querySelectorAll(".booksearchbar--text > p")[3]
    }

    #bookSearchSearchTypeGerman = true;
    #bookSearchSearchExact = false;
    #lastSearch = "";

    #booksearchDB = [];

    #isShown;

    constructor() {
        super("booksearch");
        this.registerOnHideEvent(() => this.#onHide());
        this.registerOnShowEvent(() => this.#onShow());
        this.registerOnInit(() => this.#onInit());
    }

    #onInit() {
        this.#search.addEventListener("keyup", (e) => {
            this.#runBookSearchForLatinVocabulary(e.target.value);
        })


        this.#results.innerHTML = "Donwloading database ....";

        console.log("[Booksearch] Downloading database ...");

        loadJSONFromURL(BOOKSEARCH_DATABASE).then(res => {
            this.#booksearchDB = res.sort((a, b) => a[0].localeCompare(b[0]));
            
            console.log("[Booksearch] Loaded " + this.#booksearchDB.length + " vocabs from database");

            if (this.#isShown)
                this.#runBookSearchForLatinVocabulary(this.#search.value);
            else
                this.#onHide();

        })
    }

    #onHide() {
        if(this.#isShown != undefined) console.log("[Booksearch] Activated Idle Mode");
        this.#isShown = false;
        this.#results.innerHTML = "Search is in IDLE Mode to save system resources";
    }

    #onShow() {
        this.#isShown = true;
        this.#runBookSearchForLatinVocabulary("");
    }

    #updateBookSearchUI = (counter, max) => {
        this.#booksearchUI.exactType.innerHTML = `Exakt: ${this.#bookSearchSearchExact ? "<b>" : "<sel>"}An${this.#bookSearchSearchExact ? "</b>" : "</sel>"}/${this.#bookSearchSearchExact ? "<sel>" : "<b>"}Aus${this.#bookSearchSearchExact ? "</sel>" : "</b>"}`;

        this.#booksearchUI.searchType.innerHTML = `Suche: ${this.#bookSearchSearchTypeGerman ? "<b>" : "<sel>"}Latein${this.#bookSearchSearchTypeGerman ? "</b>" : "</sel>"}/${this.#bookSearchSearchTypeGerman ? "<sel>" : "<b>"}Deutsch${this.#bookSearchSearchTypeGerman ? "</sel>" : "</b>"}`;
        this.#booksearchUI.found.innerHTML = `${this.#renderBookSearchShown4Digit(counter)}/${max} gefunden`;
        this.#booksearchUI.shown.innerHTML = `${this.#renderBookSearchShown(counter)}/${max} angezeigt`;

        this.#booksearchUI.exactType.querySelector("sel").addEventListener("click", () => {
            this.#bookSearchSearchExact = !this.#bookSearchSearchExact;
            this.#runBookSearchForLatinVocabulary(this.#lastSearch);
        });

        this.#booksearchUI.searchType.querySelector("sel").addEventListener("click", () => {
            this.#bookSearchSearchTypeGerman = !this.#bookSearchSearchTypeGerman;
            this.#runBookSearchForLatinVocabulary(this.#lastSearch);
        });

    }

    #findLatinVocabularyFromBook = (name) => {
        if (name == "") return this.#booksearchDB;

        return this.#booksearchDB.filter(data => data[0].toLowerCase().includes(name) && (!this.#bookSearchSearchExact || data[0].toLowerCase().startsWith(name.at(0))))
    }

    #findGermanVocabularyFromBook = (name) => {
        if (name == "") return this.#booksearchDB;

        return this.#booksearchDB.filter(data => data[1].toLowerCase().includes(name) && (!this.#bookSearchSearchExact || data[1].toLowerCase().startsWith(name.at(0))))
    }

    #generateBookSearchResult = (latin, german) => {
        return ` <div class="booksearch--entry">
            <div class="booksearch--entry--latin">${latin}</div>
            <div class="booksearch--entry--spacer"><div></div></div>
            <div class="booksearch--entry--german">${german}</div>
        </div>`;
    }

    #renderBookSearchShown = (number, result = " &nbsp; ") => {
        if (number >= 100) result += "100"
        else if (number >= 10) result += "&nbsp; " + number;
        else result += "&nbsp; &nbsp; " + number;
        return result;
    }

    #renderBookSearchShown4Digit = (number) => {
        let result = "";
        if (number >= 1000) result += number;
        else if (number >= 100) result += "&nbsp; " + number;
        else if (number >= 10) result += "&nbsp; &nbsp; " + number;
        else result += "&nbsp; &nbsp; &nbsp; " + number;
        return result;
    }

    #runBookSearchForLatinVocabulary = (input) => {
        console.log("[Booksearch] Running search for \"" + input + "\"");

        this.#lastSearch = input;

        const search = this.#bookSearchSearchTypeGerman ? this.#findLatinVocabularyFromBook(input) : this.#findGermanVocabularyFromBook(input);
        let counter = 0;
        let str = "<span class=\"booksearch--warning\">Achtung ~ 0.5% der Vokabel enthalten einen Fehler!</span>";
        for (const se of search) {
            counter++;
            if (counter <= 100) str += this.#generateBookSearchResult(se[0], se[1]);
        }

        this.#booksearchUI.results.innerHTML = str;

        console.log("[Booksearch] Found " + search.length + " results for \"" + input + "\"");

        setTimeout((counter, max) => this.#updateBookSearchUI(counter, max), 0, counter, this.#booksearchDB.length)
    }

}