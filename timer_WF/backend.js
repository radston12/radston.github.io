const LAST_DAY = new Date("2024-12-20T12:00:00.000Z");
const TYPE_OF_FREE_DAY = {
    NATIONALFEIERTAG: { name: "Nationalfeiertag", datum: "26.10" },
    HERBSTFERIEN: { name: "Herbstferien", datum: "27.10-31.10" },
    ALLERHEILIGEN: { name: "Allerheiligen", datum: "01.11" },
    ALLERSEELEN: { name: "Allerseelen", datum: "02.11" },
    SCHULAUTONOM_HERBST: { name: "Schulautonom", datum: "03.11" },
    LANDESPATRON: { name: "Landespatron", datum: "15.11" },
    MARIAEMPFAENGNISS: { name: "Mariaempfängniss", datum: "08.12" },
    WEIHNACHTSFERIEN: { name: "Weihnachtsferien", datum: "24.12-06.01" },
    SEMESTERFERIEN: { name: "Semesterferien", datum: "05.02-11.02" },
    OSTERFERIEN: { name: "Osterferien", datum: "23.03-01.04" },
    SCHULAUTONOM_OSTERN: { name: "Schulautonom", datum: "02.04" },
    STAATSFEIERTAG: { name: "Staatsfeiertag", datum: "01.05" },
    CHRISTIHIMMELFAHRT: { name: "Christi Himmelfahrt", datum: "09.05" },
    PFINGSTFERIEN: { name: "Pfingstferien", datum: "18.05-20.05" },
    SCHULAUTONOM_PFINGSTEN: { name: "Schulautonom", datum: "21.05" },
    FROHNLEICHNAHM: { name: "Fronleichnam", datum: "30.05" },
    SCHULAUTONOM_ENDE: { name: "Schulautonom", datum: "31.05" },
    WEEKEND: { name: "Wochenende" }
}


let currentTime = document.querySelector(".currentTime");
let fpsDebug = document.querySelector(".fpsCounter");
let fpsCounter = 0;
let fps = 0;
let days = document.querySelector(".days > span");
let hours = document.querySelector(".hours > span");
let minutes = document.querySelector(".minutes > span");
let seconds = document.querySelector(".seconds > span");
let milliseconds = document.querySelector(".milliseconds > span");
let sdays = document.querySelector(".sdays > span");
let free = document.querySelector(".free > span");
let weekends = document.querySelector(".weekends > span");
let yesterday = document.querySelector(".yesterday > span");
let today = document.querySelector(".today > span");
let tomorrow = document.querySelector(".tomorrow > span");


const getTypeOfDay = (date) => {
    if (date.getDay() === 0 || date.getDay() === 6) return TYPE_OF_FREE_DAY.WEEKEND;

    let month = date.getMonth();
    let day = date.getDate();

    if (month == 7) return TYPE_OF_FREE_DAY.WEEKEND // sommerferien
    if (month == 8 && day <= 1) return TYPE_OF_FREE_DAY.WEEKEND // sommerferien

    if (month == 9) { // Oktober
        //if (day == 26) return TYPE_OF_FREE_DAY.NATIONALFEIERTAG;
        if (day >= 27 && day <= 31) return TYPE_OF_FREE_DAY.HERBSTFERIEN;
    } else if (month == 10) { // November
        if (day == 1) return TYPE_OF_FREE_DAY.ALLERHEILIGEN;
        //if (day == 2) return TYPE_OF_FREE_DAY.ALLERSEELEN;
      //  if (day == 3) return TYPE_OF_FREE_DAY.SCHULAUTONOM_HERBST;
        if (day == 15) return TYPE_OF_FREE_DAY.LANDESPATRON;
    } else if (month == 11) {
       // if (day == 8) return TYPE_OF_FREE_DAY.MARIAEMPFAENGNISS;
        if (day >= 23) return TYPE_OF_FREE_DAY.WEIHNACHTSFERIEN;
    } else if (month == 0) {
        if (day <= 6) return TYPE_OF_FREE_DAY.WEIHNACHTSFERIEN;
    } else if (month == 1) {
        if (day >= 3 && day <= 8) return TYPE_OF_FREE_DAY.SEMESTERFERIEN;
    } else if (month == 2) {
    } else if (month == 3) {
        if (day >= 14 && day <= 21) return TYPE_OF_FREE_DAY.OSTERFERIEN;
      //  if (day == 1) return TYPE_OF_FREE_DAY.OSTERFERIEN;
        //if(day == 1) return TYPE_OF_FREE_DAY.STAATSFEIERTAG;
        if (day == 22) return TYPE_OF_FREE_DAY.SCHULAUTONOM_OSTERN;
    } else if (month == 4) { // 5
        if (day == 1) return TYPE_OF_FREE_DAY.STAATSFEIERTAG;
        if (day == 2) return TYPE_OF_FREE_DAY.STAATSFEIERTAG;
        if (day == 29) return TYPE_OF_FREE_DAY.CHRISTIHIMMELFAHRT;
        if (day == 30) return TYPE_OF_FREE_DAY.CHRISTIHIMMELFAHRT;
    } else if (month == 5) {
        if (day >= 7 && day <= 9) return TYPE_OF_FREE_DAY.PFINGSTFERIEN;
        if (day == 19) return TYPE_OF_FREE_DAY.FROHNLEICHNAHM;
        //if (day == 21) return TYPE_OF_FREE_DAY.SCHULAUTONOM_PFINGSTEN;
    }
    return;
}

const testDaysFromTo = (fromOrig = new Date(), to = LAST_DAY, addition = 1000 * 60 * 60 * 24) => {
    let from = new Date(fromOrig.getTime()); // clone

    let result = {
        school: 0,
        weekends: 0,
        free: 0,
        entrys: {}
    }

    while (from.getTime() <= to.getTime()) {
        let type = getTypeOfDay(from);
        from.setTime(from.getTime() + addition);

        if (!type) {
            result.school++;
            continue;
        }

        if (!type.datum) {
            result.weekends++;
            continue;
        }

        result.entrys[type.datum] = type;
        result.free++;

    }

    return result;
}

const shouldInclude = (variable, spacer, varlen = 2) => { return variable != undefined ? variable.formatNumber(varlen, variable) + spacer : "" };

const getExactTimeUntil = (until = LAST_DAY, spacer = ":") => {
    let diff = until.getTime() - Date.now();

    let ms = diff % 1000;
    let s = Math.floor(diff / 1000) % 60;
    let m = Math.floor(diff / (1000 * 60)) % 60;
    let h = Math.floor(diff / (1000 * 60 * 60)) % 24;
    let d = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (d == 0) d = undefined;
    if (!d && h == 0) h = undefined;

    return { ms, s, m, h, d };
}

const getCurrentTime = () => {
    const date = new Date();
    const dateTime = date.getTime();

    let ms = dateTime % 1000;
    let s = Math.floor(dateTime / 1000) % 60;
    let m = Math.floor(dateTime / (1000 * 60)) % 60;
    let h = Math.floor(dateTime / (1000 * 60 * 60)) % 24;

    let d = date.getDate();
    let mo = date.getMonth() + 1;
    let y = date.getFullYear();

    return `${shouldInclude(d, "")}.${shouldInclude(mo, "")}.${y} ${shouldInclude(h + 2, "")}:${shouldInclude(m, "")}:${shouldInclude(s, "")}:${shouldInclude(ms, "", 3)}`
}

const updateBigTimer = () => {
    const school = getExactTimeUntil();
    days.innerHTML = shouldInclude(school.d, "");
    hours.innerHTML = shouldInclude(school.h, "");
    minutes.innerHTML = shouldInclude(school.m, "");
    seconds.innerHTML = shouldInclude(school.s, "");
    milliseconds.innerHTML = shouldInclude(school.ms, "", 3);
}


const updateSmallTimer = () => {
    const school = testDaysFromTo();
    sdays.innerHTML = shouldInclude(school.school, "");
    free.innerHTML = shouldInclude(school.free, "");
    weekends.innerHTML = shouldInclude(school.weekends, "");
}

const writeToElement = (ele, date) => {
    let typeOfDay = getTypeOfDay(date);
    if (typeOfDay == undefined) typeOfDay = "Schultag";
    else typeOfDay = typeOfDay.name;
    ele.innerHTML = typeOfDay;
}

const animate = () => {
    fpsCounter++;
    currentTime.innerHTML = getCurrentTime();
    updateBigTimer();
    updateSmallTimer();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

setInterval(() => {
    fps = fpsCounter;
    fpsCounter = 0;
    fpsDebug.innerHTML = "(" + fps + " FPS)";
}, 1000)

Number.prototype.formatNumber = (varlen, target) => {
    let string = target.toString();
    while (string.length < varlen) string = "0" + string;
    return string;
}