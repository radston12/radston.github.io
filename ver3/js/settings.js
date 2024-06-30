const ROOT = selectElement(":root");

const CS = getComputedStyle(ROOT);

let COLOR_SETTINGS = [
    {
        cssVar: "--text-primary",
        element: selectElement("[setting=\"text_primary\"]"),
        current: "#cc81fd",
        default: "#cc81fd"
    },
    {
        cssVar: "--text-secondary",
        element: selectElement("[setting=\"text_sekundary\"]"),
        current: "#5c92ff",
        default: "#5c92ff"
    },
    {
        cssVar: "--bg-primary",
        element: selectElement("[setting=\"back_primary\"]"),
        current: "#000000",
        default: "#000000"
    },
    {
        cssVar: "--bg-secondary",
        element: selectElement("[setting=\"back_second\"]"),
        current: "#17141a",
        default: "#17141a"
    },
    {
        cssVar: "--bg-tertiary",
        element: selectElement("[setting=\"back_tertiary\"]"),
        current: "#121212",
        default: "#121212"
    },
    {
        cssVar: "--accent",
        element: selectElement("[setting=\"accent\"]"),
        current: "#707070",
        default: "#707070"
    }
];


const updateLocalStorageSettingColors = (update = false) => {
    const stored = JSON.parse(localStorage.getItem("settings_colors"));
    if (!stored || update) {
        const toStore = {};

        for (const setting of COLOR_SETTINGS) {
            toStore[setting.cssVar] = setting.current;

        }

        localStorage.setItem("settings_colors", JSON.stringify(toStore));
        update = false;
        return;
    }

    for (const setting of COLOR_SETTINGS) {
       setting.current = stored[setting.cssVar];
    }
}

try {
    updateLocalStorageSettingColors();
} catch (e) {
    localStorage.clear();
    updateLocalStorageSettingColors();
}

let hasRegistered = true;

const settings_change = () => {
    for (const setting of COLOR_SETTINGS) {
        ROOT.style.setProperty(setting.cssVar, setting.current);
        setting.element.value = CS.getPropertyValue(setting.cssVar);

        if(hasRegistered)
            setting.element.addEventListener("input", (elem) => {
                ROOT.style.setProperty(setting.cssVar, elem.target.value);
            });

        hasRegistered = false;
    }

}

settings_change();

// save

const register = () => {
    const saveButton = selectElement("[setting=save1_save]");
    const origSaveButtonName = saveButton.innerHTML;
    const readButton = selectElement("[setting=save1_read]");
    const origReadButtonName = readButton.innerHTML;
    const deleteButton = selectElement("[setting=save1_delete]");
    const origDeleteButtonName = deleteButton.innerHTML;

    const showSuccess = (normalText, target, text = " (Success!)") => {
        target.innerHTML = normalText + text;
        setTimeout((back, target) => { target.innerHTML = back; }, 1000, normalText, target)
    }

    saveButton.addEventListener("click", (e) => {
        saveProgress("save1");
        showSuccess(origSaveButtonName, saveButton);
    });

    readButton.addEventListener("click", (e) => {
        if (!(localStorage.getItem("save1") != 'undefined' && localStorage.getItem("save1").length > 2)) {
            showSuccess(origReadButtonName, readButton, " (ERROR: No save found)");
            return;
        }

        load("save1");
        showSuccess(origReadButtonName, readButton);
    });

    deleteButton.addEventListener("click", (e) => {
        clearStorage("save1");
        showSuccess(origDeleteButtonName, deleteButton);
    });

}

register();


const save = () => {
    for (const setting of COLOR_SETTINGS) {
        setting.current = setting.element.value;
    }

    updateLocalStorageSettingColors(true);
}

const reset = () => {
    for (const setting of COLOR_SETTINGS) {
        setting.current = setting.default;
    }
    settings_change();
    save();
}

selectElement("[button_id=\"settings_save\"]").addEventListener("click", save);
selectElement("[button_id=\"settings_reset\"]").addEventListener("click", reset);






