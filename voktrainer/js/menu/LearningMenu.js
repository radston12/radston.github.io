class LearningMenu extends Menu {
    #ButtonObjects = {
        PERFECT: {
            name: selectElement("th[learning_text=\"perfect\"]"),
            button: selectElement("td[learning_button=\"perfect\"]")
        },
        HARDLY: {
            name: selectElement("th[learning_text=\"hardly\"]"),
            button: selectElement("td[learning_button=\"hardly\"]")
        },
        BLACKOUT: {
            name: selectElement("th[learning_text=\"blackout\"]"),
            button: selectElement("td[learning_button=\"blackout\"]")
        },
        REVEAL: {
            name: selectElement("th[learning_text=\"reveal\"]"),
            button: selectElement("td[learning_button=\"reveal\"]")
        },
        REMEMBER: {
            name: selectElement("th[learning_text=\"remember\"]"),
            button: selectElement("td[learning_button=\"remember\"]"),
            icon: selectElement('td[learning_button=\"remember\"] > i')
        }
    }
    #CurrentButton = Button.NONE
    #Question = {
        obj: selectElement(".learning_question"),
        sub: selectElement(".learning_question > .subquestion"),
        question: selectElement(".learning_question > .question"),
        showing: selectElement(".learning_question > .showing"),
    }
    #UI = {
        toRevise: selectElement('[learning_ui="toRevise"]'),
        toLearn: selectElement('[learning_ui="toLearn"]'),
        learned: selectElement('[learning_ui="learned"]'),
        percent: selectElement('[learning_ui="percent"]'),
        lightningvocabulary: selectElement('[learning_ui="lightningvocabulary"]')
    }
    #Data = {
        currentVocabular: {
            vocabulary: {
                id: -1,
                text: []
            },
            lastRevisionDate: -1,
            nextRevisionTime: -1,
            nextRevisionDate: 0
        },
        vocabularyData: {
            201: [0, 0, 2.5, Date.now()]
        },
        tempEntries: [],
        tempSorted: {},
        statistics: {
            toRevise: -1,
            toLeran: -1,
            learned: -1
        }
    }
    #Timeouts = {
        started: -1,
        took: -1,
    }
    #trainingAlgothim;

    constructor() {
        super("learning");
        this.registerOnKeypressEvent((ev) => this.#onKeypress(ev, this));
        this.registerOnInit(() => this.#onInit());
    }

    static load(menu) {
    }

    // EVENT from MenuManager
    #onKeypress(keypressEvent, menu) {
        if (this.#CurrentButton == Button.AWNSERS) {
            if (keypressEvent.keyCode == 97) menu.#handleLearningAwnser("perfect");
            if (keypressEvent.keyCode == 115) menu.#handleLearningAwnser("hardly");
            if (keypressEvent.keyCode == 100) menu.#handleLearningAwnser("blackout");
        } else if (this.#CurrentButton == Button.SHOWAWNSERS) {
            if (keypressEvent.keyCode == 119) menu.#onShowLearningAwnser();
        }
    }

    // EVENT from MenuManager
    #onInit() {
        initRemember(this.#ButtonObjects.REMEMBER.button, () => this.#revealLearningAwnser(), () => this.#getCurrentVocabulary());
        initRemember(this.#ButtonObjects.REMEMBER.name, () => this.#revealLearningAwnser(), () => this.#getCurrentVocabulary());

        // this.#loadStorage();

        this.#showLearningButtons(Button.SHOWAWNSERS);

        this.#ButtonObjects.REVEAL.button.addEventListener("click", (ev) => this.#onShowLearningAwnser(ev));
        this.#ButtonObjects.REVEAL.name.addEventListener("click", (ev) => this.#onShowLearningAwnser(ev));

        this.#registerButtonHandler(this.#ButtonObjects.BLACKOUT, "blackout");
        this.#registerButtonHandler(this.#ButtonObjects.HARDLY, "hardly");
        this.#registerButtonHandler(this.#ButtonObjects.PERFECT, "perfect");

        // replace with loader this.Timeouts.onLoad = setTimeout(onLearningLoad, 350);

        loadJSONFromURL(LEARN_DATABASE).then(res => {
            this.#trainingAlgothim = new TrainingAlgorithm(res);
            this.#loadNextVocabulary();

        })
    }

    #hideLearningButtons() {
        for (const [, elements] of Object.entries(this.#ButtonObjects)) {
            elements.button.style.display = "none";
            elements.name.style.display = "none";
        }
    }

    #setLearningButton(button, state) {
        button.button.style.display = (state ? "table-cell" : "none")
        button.name.style.display = (state ? "table-cell" : "none")
    }

    #showLearningButtons(button) {

        this.#CurrentButton = button;

        this.#hideLearningButtons();

        if (button == Button.SHOWAWNSERS) {
            this.#setLearningButton(this.#ButtonObjects.REVEAL, true)
            return;
        }

        this.#setLearningButton(this.#ButtonObjects.BLACKOUT, true)
        this.#setLearningButton(this.#ButtonObjects.HARDLY, true)
        this.#setLearningButton(this.#ButtonObjects.PERFECT, true)
        this.#setLearningButton(this.#ButtonObjects.REMEMBER, true)

    }

    #onShowLearningAwnser(event) {
        if (event) event.preventDefault();

        this.#revealLearningAwnser();
        this.#showLearningButtons(Button.AWNSERS);
    }


    #addLearningAwnser(awnser) { this.#Question.showing.innerHTML += "<hr><text>" + awnser + "</text>"; }
    #showLearningQuestion(question) { this.#Question.question.innerHTML = question; }
    #clearLearningAwnsers() { this.#Question.showing.innerHTML = ""; }

    #updateLearningUi() {

        this.#Data.statistics = this.#trainingAlgothim.generateStatistics();

        const percent = Math.floor((this.#Data.statistics.learned / this.#Data.statistics.count) * 1000) / 10 // 0.1 accuarcy 
        const percentLightning = Math.floor((this.#Data.statistics.lightningVoc / this.#Data.statistics.count) * 1000) / 10 // 0.1 accuarcy 

        this.#UI.toRevise.innerHTML = this.#Data.statistics.toRevise;
        this.#UI.toLearn.innerHTML = this.#Data.statistics.toLearn;
        this.#UI.learned.innerHTML = this.#Data.statistics.learned;
        this.#UI.percent.innerHTML = percent + "%";
        this.#UI.lightningvocabulary.innerHTML = percentLightning + "%";

        if (Math.ceil(Math.random() * 30) == 15)
            analytics.send("LEARNING - STATS", "" + JSON.stringify(this.#Data.statistics));
    }

    #revealLearningAwnser() {
        this.#Timeouts.took = (Date.now() - this.#Timeouts.started) / 1000;

        this.#clearLearningAwnsers();
        let index = 0;
        for (const iter of this.#getCurrentVocabulary()) {
            if (index != 0 && iter && iter.length >= 2) this.#addLearningAwnser(iter);
            index++;
        }
        if (isRemeberd(this.#getCurrentVocabulary()))
            this.#ButtonObjects.REMEMBER.icon.innerHTML = "star";
        else
            this.#ButtonObjects.REMEMBER.icon.innerHTML = "star_border";
    }

    #handleLearningAwnser(button) {

        let stage = 0, took = this.#Timeouts.took;

        if (button == "perfect") {
            if (took >= 15)
                stage = 4
            else
                stage = 5;
        } else if (button == "hardly") {
            if (took >= 15)
                stage = 2
            else
                stage = 3;
        } else if (button == "blackout" && took >= 25)
            stage = 1;

        this.#trainingAlgothim.review(stage);

                
        analytics.sendLearningReport(this.#Data.currentVocabular.vocabulary.id, stage, took);

        this.#loadNextVocabulary();
    }

    #getCurrentVocabulary() {
        return this.#Data.currentVocabular.vocabulary.text; //.vocab;
    }

    #loadNextVocabulary() {
        this.#clearLearningAwnsers();

        this.#Data.currentVocabular = this.#trainingAlgothim.getNextVocabulary();//this.#getRandomVocabulary();
        this.#updateLearningUi();

        this.#showLearningButtons(Button.SHOWAWNSERS);

        this.#Timeouts.started = Date.now();

        this.#showLearningQuestion(this.#getCurrentVocabulary()[0]);
    }

    #registerButtonHandler(obj, button) {
        const handler = (event) => {
            event.preventDefault();
            this.#handleLearningAwnser(button);
        };

        obj.button.addEventListener("click", handler);
        obj.name.addEventListener("click", handler);
    }

}