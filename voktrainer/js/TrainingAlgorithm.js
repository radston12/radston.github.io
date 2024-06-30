class TrainingAlgorithm {
    static getLocalStorageName() { return "learning" }
    static getCompressedTime() { return Math.floor((Date.now() - 1704063601000) / 1000 / 60 / 60) }

    vocabularyIDDatabase = {};
    data = [];
    coveredVocabularyList = [];

    constructor(vocabularyIDDatabaseToCopy) {
        for (const entry of Object.entries(vocabularyIDDatabaseToCopy)) {

            const ele = entry[1];
            if (ele[0].startsWith("#")) continue;

            this.vocabularyIDDatabase[entry[0]] = ele;
        }

        this.loadOrGenerate();
    }

    getNextVocabulary() {
        // Well yes not very efficient i know but i dont have time 

        this.data = mixArray(this.data);
        this.data.sort((a, b) => a.nextRevisionDate - b.nextRevisionDate);

        return this.data[0];
    }

    review(successLevel) {
        const newData0 = {
            ...this.data[0],
        }

        newData0.lastRevisionDate = TrainingAlgorithm.getCompressedTime();

        if (newData0.nextRevisionTime == -1) newData0.nextRevisionTime = 1;

        newData0.nextRevisionTime = Math.floor(newData0.nextRevisionTime * (0.5 * (successLevel ^ 1.00125))) // TODO: Adjust values Math.floor(hours for complete black * (newData0.nextRevisionTime * 0.4)) 
        if (successLevel == 0) newData0.nextRevisionTime = -1;
        else if (successLevel == 1) newData0.nextRevisionTime = 1;

        newData0.nextRevisionDate = (Number.parseInt(newData0.lastRevisionDate) + Number.parseInt(newData0.nextRevisionTime))

        this.data[0] = newData0;
        this.save();
    }

    generateStatistics() {

        let stats = {
            toRevise: 0,
            toLearn: 0,
            learned: 0,
            lightningVoc: 0,
            count: this.data.length
        }

        const CURRENT_DATE = TrainingAlgorithm.getCompressedTime();

        for (const entry of this.data) {
            if (entry.lastRevisionDate == -1) {
                stats.toLearn++;
                continue;
            }

            if (entry.nextRevisionDate < CURRENT_DATE) {
                stats.toRevise++;
            } else {
                stats.learned++;
                if (entry.nextRevisionTime > 24)
                    stats.lightningVoc++;
            }
        }

        return stats;
    }

    /**
     * Example Save Data:
     * [
     *  [vocID, revisionDate 0 beeing 2024-1-1, next revision in hours],
     *  ...
     * ]
     */

    #fillList() {
        for (const vocabularyID of Object.entries(this.vocabularyIDDatabase)) {

            if (this.coveredVocabularyList.includes(Number.parseInt(vocabularyID))) continue;

            this.data.push({
                vocabulary: {
                    id: Number.parseInt(vocabularyID),
                    text: this.vocabularyIDDatabase[Number.parseInt(vocabularyID)]
                },
                lastRevisionDate: -1,
                nextRevisionTime: -1,
                nextRevisionDate: 0
            });
        }
    }

    #loadFromData(storedData) {
        let faultyCounter = 0;

        for (const element of storedData) {

            this.coveredVocabularyList.push(Number.parseInt(element[0]));

            const dbEntry = this.vocabularyIDDatabase[Number.parseInt(element[0])];
            
            if(!dbEntry || dbEntry[0].startsWith("#")) {
                console.warn("[TrainingAlgorithm] Found vocabulary that is no longer supported in device storage! Deleting from local storage ... [DEBUG INFO - VOCABULARY_DATABASE_IDENTIFYER: " + element[0] + ")")
                faultyCounter++;
                continue;
            }

            this.data.push({
                vocabulary: {
                    id: Number.parseInt(element[0]),
                    text: this.vocabularyIDDatabase[Number.parseInt(element[0])]
                },
                lastRevisionDate: element[1],
                nextRevisionTime: element[2],
                nextRevisionDate: (Number.parseInt(element[1]) + Number.parseInt(element[2]))
            });

        }

        
        console.log("[TrainingAlgorithm] Loaded trainer algorithm data for " + this.data.length + " vocab from device storage");

        if(faultyCounter != 0) {
            console.error("[TrainingAlgorithm] Had to remove " + faultyCounter + " vocabularys from local storage to avoid errors");
            if (faultyCounter > 5) {
                localStorage.setItem("faultVocabulary_" + faultyCounter + "_" + TrainingAlgorithm.getLocalStorageName(), storedData);
                console.error("[TrainingAlgorithm] Since this number (> 5) is not normal an automatic backup was created (DEBUG_NAME: \"" + ("faultVocabulary_" + faultyCounter + "_" + TrainingAlgorithm.getLocalStorageName()) + "\")!");
            }
        }

    }

    save() {
        let toStore = [];

        for (const element of this.data) {
            if (element.lastRevisionDate == -1) continue;

            toStore.push([element.vocabulary.id, element.lastRevisionDate, element.nextRevisionTime]);
        }

        localStorage.setItem(TrainingAlgorithm.getLocalStorageName(), JSON.stringify(toStore));
    }

    loadOrGenerate() {
        let storedData = localStorage.getItem(TrainingAlgorithm.getLocalStorageName());

        if (storedData) storedData = JSON.parse(storedData);

        this.data = [];
        this.coveredVocabularyList = [];


        if (!(storedData instanceof Array) && storedData) {
            console.error("[TrainingAlgorithm] Detected old trainer save data! Discarding ...")
            localStorage.setItem("backup_" + TrainingAlgorithm.getLocalStorageName(), storedData);
            localStorage.setItem(TrainingAlgorithm.getLocalStorageName(), "[]");
            storedData = undefined;
        }

        if (storedData) this.#loadFromData(storedData);

        this.#fillList();

        console.log("[TrainingAlgorithm] Loaded data for " + this.data.length + " vocab")

    }

}