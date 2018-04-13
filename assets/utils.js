window.q = function(query) {
    return document.querySelector(query);
}

window.qe = function(query, func) {
    var elements = document.querySelectorAll(query);
    elements.forEach(func);
}

window.qee = function(element, query, func) {
    var elements = element.querySelectorAll(query);
    elements.forEach(func);
}

window.joinUrl = function(baseUrl, url) {
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

window.fetchRetry = function(urls, suffix) {
    var i = 0;

    return new Promise((resolve, reject) => {
        function success(response) {
            if(!response.ok) {
                throw new Error("Invalid response code: " + response.status);
            }

            resolve(response);
        }

        function failure(error) {
            if(i < urls.length) {
                fetchUrl();
            } else {
                reject(error);
            }
        }
        function finalHandler(finalError) {
            throw finalError;
        }
        function fetchUrl() {
            return fetch(urls[i++] + suffix)
                .then(success)
                .catch(failure)
                .catch(finalHandler);
        }
        fetchUrl();
    });
}