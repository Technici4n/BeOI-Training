/*global Promise, console*/

function JsonPromise(url) {
    "use strict";
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("GET", url);
        req.addEventListener("load", function () {
            resolve(JSON.parse(req.responseText));
        });
        req.send();
    });
}

function CachedResults(produce, timeout) {
    "use strict";
    var cache = {};
    function isOutdated(id) {
        if (timeout === undefined) {
            return false;
        } else {
            return cache[id].time + timeout < Date.now();
        }
    }
    this.get = function (id) {
        if (!cache.hasOwnProperty(id) || isOutdated(id)) {
            cache[id] = {
                time: Date.now(),
                content: produce(id)
            };
        }
        return cache[id].content;
    };
}

function makeCell(content) {
    "use strict";
    var cellElt = document.createElement("th");
    cellElt.textContent = content;
    return cellElt;
}