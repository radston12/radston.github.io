class TestingMenu extends Menu {
    constructor () {
        super("trainer")
        this.registerOnKeypressEvent(this.onKeypress);
    }

    onKeypress(keypressEvent) {
        handleTrainKeyPress(keypressEvent);
    }
}