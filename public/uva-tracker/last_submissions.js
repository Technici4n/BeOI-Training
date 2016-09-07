/*global console, uh, uhuntIds, makeCell*/

var numSubs = 20; // Number of last submissions to display
var refreshTime = 5000; // Time between refreshes (millis)
var problemPageBase = "https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=";

function formatTime(timestamp) {
    "use strict";
    function pad2(number) {
        if (number < 10) {
            return "0" + number;
        } else {
            return number;
        }
    }
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        date = new Date(timestamp * 1000);
    return months[date.getMonth()] + " " + date.getDate() + ", "
        + pad2(date.getHours()) + ":" + pad2(date.getMinutes());
}

function makeSubmissionRow(sub) {
    "use strict";
    var rowElt = document.createElement("tr"),
        problemCell = document.createElement("th"),
        problemLink = document.createElement("a");
    
    problemLink.textContent = "Problem " + sub.problemId;
    problemLink.href = problemPageBase + sub.problemId;
    problemCell.appendChild(problemLink);
    
    uh.problemData.get(sub.problemId).then(function (data) {
        problemLink.textContent = data.num + " - " + data.title;
    });
    
    rowElt.appendChild(makeCell(sub.name));
    rowElt.appendChild(problemCell);
    rowElt.appendChild(makeCell(sub.verdict));
    rowElt.appendChild(makeCell(sub.lang));
    rowElt.appendChild(makeCell(sub.runTime.toFixed(3)));
    rowElt.appendChild(makeCell(formatTime(sub.submitTime)));
    return rowElt;
}

function refreshTable() {
    "use strict";
    var subTable = document.getElementById("submissions-table"),
        subs = [],
        received = 0;
    
    function computeTable() {
        // Sort by decreasing submission ID
        subs.sort(function (sub1, sub2) {
            return sub2.id - sub1.id;
        });
        // Truncate to first numSubs elements
        subs.length = Math.min(subs.length, numSubs);
        // Clear and refill table
        subTable.innerHTML = "";
        subs.forEach(function (sub) {
            subTable.appendChild(makeSubmissionRow(sub));
        });
    }
    
    // Load last numSubs submissions for each user
    uhuntIds.forEach(function (userId) {
        uh.userData.get(userId).then(function (data) {
            data.subs.forEach(function (sub) {
                subs.push(sub);
            });
            received += 1;
            if (received === uhuntIds.length) {
                computeTable();
            }
        });
    });
}

refreshTable();
setInterval(refreshTable, refreshTime);