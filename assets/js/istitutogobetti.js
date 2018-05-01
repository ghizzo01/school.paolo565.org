"use strict";

const schoolUrl = "http://www.istitutogobetti.it";

const getArticlePageLink = async function(allowCache = true) {
    if(allowCache) {
        const articlePageLink = localStorage.getItem("articlepage-url");
        if(articlePageLink) {
            return articlePageLink;
        }
    }

    // Request the home page
    const homePageResponse = await fetchCors(schoolUrl);
    const homePageText = await homePageResponse.text();
    const homeBody = await parseHtml(homePageText);

    let partialArticlePageLink;
    await qee(homeBody, "#jsn-pleft a", homePageLink => {
        const linkText = homePageLink.innerHTML;

        if(linkText.indexOf("Orario") == -1 || linkText.indexOf("lezioni") == -1) {
            return;
        }

        partialArticlePageLink = homePageLink.getAttribute("href");
    });

    if(!partialArticlePageLink) {
        return;
    }

    // Request the schedule article
    const articlePageLink = joinUrls(schoolUrl, partialArticlePageLink);
    localStorage.setItem("articlepage-url", articlePageLink);
    return articlePageLink;
}

const getSchedulePageLink = async function(articlePageLink, allowCache = true) {
    if(allowCache) {
        const schedulePageLink = localStorage.getItem("schedulepage-url");
        if(schedulePageLink) {
            return schedulePageLink;
        }
    }

    const articlePageResponse = await fetchCors(articlePageLink);
    const articlePageText = await articlePageResponse.text();
    const articlePageBody = await parseHtml(articlePageText);

    let schedulePageLink;
    await qee(articlePageBody, "#jsn-mainbody a", articleLink => {
        const articleHref = articleLink.getAttribute("href");
        const articleAbsUrl = joinUrls(articlePageLink, articleHref);
        const cleanUrl = urlPath(articleAbsUrl).toLowerCase();

        if(!cleanUrl.startsWith("/web_orario") && !cleanUrl.startsWith("/weborario")) {
            return;
        }

        schedulePageLink = articleAbsUrl;
    });

    if(!schedulePageLink) {
        throw new Error("Failed to get the url pointing to the orario facile page");
    }

    localStorage.setItem("schedulepage-url", schedulePageLink);
    return schedulePageLink;
}

const getScheduleItems = async function(schedulePageLink, allowCache = true) {
    // Try loading the schedule list from the cache
    if(allowCache) {
        const cachedScheduleItems = localStorage.getItem("schedule-items");
        if(cachedScheduleItems) {
            const scheduleItems = JSON.parse(cachedScheduleItems);
            return scheduleItems;
        }
    }

    // Request the schedule list
    const schedulePageResponse = await fetchCors(schedulePageLink);
    const schedulePageText = await schedulePageResponse.text();
    const schedulePageBody = await parseHtml(schedulePageText);

    const scheduleItems = [];

    await qee(schedulePageBody, "a", schedulePage => {
        const schedulePageHref = schedulePage.getAttribute("href");  
        const schedulePageAbsUrl = joinUrls(schedulePageLink, schedulePageHref);

        let list, type;
        if(schedulePageAbsUrl.indexOf("Classi/") != -1) {
            list = "#classes";
            type = "classi";
        } else if(schedulePageAbsUrl.indexOf("Docenti/") != -1) {
            list = "#teachers";
            type = "docenti";
        } else if(schedulePageAbsUrl.indexOf("Aule/") != -1) {
            list = "#classrooms";
            type = "aule";
        } else {
            return;
        }

        scheduleItems.push({
            'list': list,
            'type': type,
            'name': schedulePage.innerText,
            'url': schedulePageAbsUrl,
        });
    });

    localStorage.setItem("schedule-items", JSON.stringify(scheduleItems));
    return scheduleItems;
}

const generateScheduleItem = function(item) {
    const liElement = document.createElement("li");
    liElement.classList.add("schedule-list-item");
    liElement.dataset.originalText = item["name"];
    liElement.dataset.url = item["url"];

    const aElement = document.createElement("a");
    aElement.href = "#/" + item["type"] + "/" + encodeURIComponent(item["name"]);
    aElement.innerText = liElement.dataset.originalText;

    liElement.dataset.type = item["type"];
    liElement.appendChild(aElement);
    q(item["list"]).appendChild(liElement);
}

const allowedEmbeddedTags = [
    "table",
    "tbody",
    "tr",
    "td",
    "p",
    "a",
];

const buildEmbeddedSchedule = async function(html) {
    const body = await parseHtml(html);
    const schedule = body.querySelectorAll("center")[1];

    await qee(schedule, "*", element => {
        const name = element.tagName.toLowerCase();
        if(allowedEmbeddedTags.indexOf(name) == -1) {
            element.parentElement.removeChild(element);
        }
    });

    await qee(schedule, "table, tr", element => {
        while(element.attributes.length > 0) {
            const name = element.attributes[0].name;
            element.removeAttribute(name);
        }
    });

    await qee(schedule, "a", element => {
        const fullUrl = element.getAttribute("href");
        if(!fullUrl.startsWith("../") || !fullUrl.endsWith(".html")) {
            alert("Skipping: " + fullUrl);
            return;
        }
        const url = fullUrl.substring(2, fullUrl.length - 5);
        const hashUrl = "#" + url.substring(0, url.lastIndexOf("/")).toLowerCase() + url.substring(url.lastIndexOf("/"));
        element.href = hashUrl;
    });

    const scheduleEl = q("#embedded-schedule");
    scheduleEl.innerHTML = schedule.innerHTML;
}

const displayScheduleItem = async function(name, type) {
    const selectedScheduleInfo = q("li[data-original-text=\"" + name + "\"][data-type=\"" + type + "\"]");
    if(selectedScheduleInfo == null) {
        window.location.hash = "/";
        openPage("#school-schedules");
        return;
    }

    const schedule = q("#embedded-schedule");
    schedule.innerHTML = "";

    q("#school-schedule-title").innerText = name;

    openPage("#school-schedule");

    // Load the table from the cache
    const cachedHtml = localStorage.getItem("scheduleitem-" + name + "-" + type);
    if(cachedHtml) {
        buildEmbeddedSchedule(cachedHtml);
    }

    // Load from the network and update the existing table if it's already there.
    const response = await fetchCors(selectedScheduleInfo.dataset.url);
    const text = await response.text();
    localStorage.setItem("scheduleitem-" + name + "-" + type, text);
    buildEmbeddedSchedule(text);
}