const corsProxies = [
    "https://cors-anywhere.herokuapp.com/",
    "https://crossorigin.me/",
];

window.q = function(query) {
    return document.querySelector(query);
}

window.qe = function(query, func) {
    const elements = document.querySelectorAll(query);
    return elements.forEach(func);
}

window.qee = function(element, query, func) {
    const elements = element.querySelectorAll(query);
    return elements.forEach(func);
}

window.joinUrls = function(baseUrl, url) {
    return new URL(url, baseUrl).href;
}

window.urlPath = function(url) {
    return new URL(url).pathname;
}

window.parseHtml = function(html) {
    const newHTMLDocument = document.implementation.createHTMLDocument("preview");
    const element = newHTMLDocument.createElement("div")
    element.innerHTML = html;

    const scripts = element.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
        scripts[i].parentNode.removeChild(scripts[i]);
    }

    return element;
}

window.escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

window.fetchCors = async function(url) {
    var nextCorsProxy = 0;
    var fails = 0;

    while(true) {
        try {
            const response = await fetch(corsProxies[nextCorsProxy] + url);
            if(!response.ok) {
                nextCorsProxy--;
                throw new Error("Invalid response: " + response.status);
            }

            return response;
        } catch(err) {
            console.log(err);
            fails++;
            nextCorsProxy++;

            if(fails > 1) {
                throw err;
            }
        };
    }
}