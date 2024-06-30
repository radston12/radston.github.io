class MenuManager {

    static #menuStorage = {
        id: 0,
        ids: [],
        currentIdentifyer: undefined,
        onInit: []
    };


    /**
     * Registers a menu
     * @param {Menu} menu 
     * @param {Boolean} isButtonless Is true if the menu should not register a button
     */
    static registerMenu(menu, isButtonless = false) {

        if (!menu || !menu.getName()) {
            console.error("[MenuManager] Cannot define menu \"undefined\"!");
            return;
        }

        const id = this.#menuStorage.id++;

        this.#menuStorage[menu.getName()] = {
            id,
            menu,
            hasButton: !isButtonless,
            element: undefined,
            button: undefined,
            onShow: [],
            onHide: [],
            onKeypress: [],
        }

        this.#menuStorage.ids.push(menu.getName());

    }

    /**
     * Adds a function to the OnShow Event
     * @param {Menu} menu 
     * @param {Function} func
     */
    static registerOnShowEvent(menu, func) {
        this.#menuStorage[menu.getName()].onShow.push(func);
    }

    /**
         * Adds a function to the OnHide Event
         * @param {Menu} menu 
         * @param {Function} func
         */
    static registerOnHideEvent(menu, func) {
        this.#menuStorage[menu.getName()].onHide.push(func);
    }

    static registerOnInit(func) {
        this.#menuStorage.onInit.push(func);
    }

    /**
     * Adds a function to the OnKeypress Event
     * @param {Menu} menu 
     * @param {Function} func
     */
    static registerOnKeypressEvent(menu, func) {
        this.#menuStorage[menu.getName()].onKeypress.push(func);
    }

    /**
     * Finishes Initalizing the MenuManager
     * Needs to be called after the DOM is initialized !
     */
    static load() {
        // Finishes Registering

        for (const menuIdentifyer of this.#menuStorage.ids) {

            const menuStorageElement = this.#menuStorage[menuIdentifyer];

            if (!menuStorageElement) {
                console.error("[MenuManager] Invalid identifyer in this.#menuStorage list!")
                continue;
            }

            const menu = menuStorageElement.menu;

            const menuDocument = document.querySelector("div[menuIdentifyer=\"" + menu.getName() + "\"]");
            const menuButton = document.querySelector("menubutton[name=\"" + menu.getName() + "\"]");

            if (!menuDocument || (!menuButton && menu.hasButton)) {
                console.error("[MenuManager] Menu [" + menu.getName() + "] must be defined in HTML-File aswell!");
                return;
            }

            this.#menuStorage[menuIdentifyer] = {
                ...menuStorageElement,
                element: menuDocument,
                button: menuButton,
            }

            console.log("[MenuManager] Successfully registerd " + menu.getName() + "!");
        }

        if(this.#menuStorage.ids.length >= 2) {
            const identifyer = this.#menuStorage.ids[0];

            this.#menuStorage[identifyer].element.style.display = "none"; // Hack Alarm! (so onHide doesnt get called on init when somebody doesnt default to display: none)

            MenuManager.showMenu(identifyer);
        }

        // Registers Menu Buttons
        const allMenuButtons = document.querySelectorAll("menubutton");
        for (const menuButton of allMenuButtons) {

            const menuName = menuButton.getAttribute("name");

            if (!menuName) {
                console.error("[MenuManager] \"menubutton\"-Element doesn't have a name attribute!")
                continue;
            }

            const storedMenu = this.#menuStorage[menuName];

            if (!storedMenu) {
                console.error("[MenuManager] \"menubutton[name='" + menuName + "']\"-Element doesn't have a registered Menu-Element!")
                continue;
            }

            menuButton.addEventListener("click", (event) => {
                let obj = event.target;
                let name = obj.getAttribute("name");
                
                let iter = 0;
                while(!name && iter++ < 3) {
                    obj = obj.parentNode;
                    name = obj.getAttribute("name");
                }

                MenuManager.showMenu(name)
           })

        }


        // Registers the keypress event

        document.onkeypress = (event) => {
            event = event || window.event; 

            const onKeypress = MenuManager.getCurrentStoredMenu().onKeypress;

            for(const func of onKeypress) func(event);
        
        }

        // Calls all init events 

        for(const func of this.#menuStorage.onInit) func();
    }

    static showMenu(identifyer) {
        const storedMenu = this.#menuStorage[identifyer];
        if (!storedMenu) {
            console.error("[MenuManager] The function showMenu can only show registered menus! (You must register " + identifyer + "!)");
            return;
        }

        console.log("[MenuManager] Switching to menu " + identifyer + "!");
            
        MenuManager.hideAllMenus();

        storedMenu.element.style.display = ""; // Reset to default
        
        if(storedMenu.hasButton && storedMenu.button.classList)
            storedMenu.button.classList.add("menu__item__active"); // TODO: Customize // DONE
        
        this.#menuStorage.currentIdentifyer = identifyer;

        for (const func of storedMenu.onShow) func();
    }


    static hideAllMenus() {
        for (const menuIdentifyer of this.#menuStorage.ids) {

            const storedMenu = this.#menuStorage[menuIdentifyer];
            const currentDisplay = storedMenu.element.style.display;

            if (currentDisplay == "none") continue;

            for (const func of storedMenu.onHide) func();
            
            storedMenu.element.style.display = "none";
            if(storedMenu.hasButton && storedMenu.button.classList)
                storedMenu.button.classList.remove("menu__item__active"); // TODO: Customize // DONE
        }
    }

    static getCurrentStoredMenu() {
        return this.#menuStorage[this.#menuStorage.currentIdentifyer];
    }
}
