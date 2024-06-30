// RELEASE VERSION - changes
if (typeof PROD_MODE === 'undefined') {
    window.PROD_MODE = false;
    window.DEV = true;
    console.debug("[VOKTRAINER] Development enviroment was detected and enabled!")
} else 
    window.DEV = false;

const VOCABULAR_DATABASE = "./db/data.json";
const LEARN_DATABASE = "./db/learning.json";
const BOOKSEARCH_DATABASE = "./db/booksearch.json";
const VERSION_NUMBER = "1.6.2-BETA";

// dev settings
const VERSION_NAME = (DEV ? "dev-" : "") + VERSION_NUMBER;

if(localStorage.getItem("opt_out") && (localStorage.getItem("opt_out").toString() == "true")) window.PROD_MODE = false;

const analytics = new Analytics(() => PROD_MODE);

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("td[setting=\"analytics\"]").innerHTML = "Status (benötigt Neuladen!): <bold>" + (PROD_MODE ? "Aktiv" : "Deaktiviert") + "</bold>";
    document.querySelector("button[setting=\"analytics\"]").innerHTML = (PROD_MODE ? "Deaktivieren" : "Aktivieren");
    document.querySelector("button[setting=\"analytics\"]").addEventListener("click", () => {
        localStorage.setItem("opt_out", PROD_MODE);
        location.reload();
    })
})