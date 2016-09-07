/*global console, uh, uhuntIds, makeCell*/

var numDays = 15; // Time period to compare users
var refreshTime = 5000; // Time between refreshes (millis)

function makeTopSolverRow(rank, user) {
    "use strict";
    var rowElt = document.createElement("tr");
    rowElt.appendChild(makeCell(rank));
    rowElt.appendChild(makeCell(user.name));
    rowElt.appendChild(makeCell(user.numSolved));
    return rowElt;
}

function refreshTable() {
    "use strict";
    var topTable = document.getElementById("top-solvers"),
        solved = [],
        received = 0;
    
    function computeTable() {
        solved.sort(function (user1, user2) {
            if (user1.numSolved !== user2.numSolved) {
                return user2.numSolved - user1.numSolved;
            } else {
                return user1.name.localeCompare(user2.name);
            }
        });
        
        topTable.innerHTML = "";
        solved.forEach(function (user, rank) {
            topTable.appendChild(makeTopSolverRow(rank + 1, user));
        });
    }
    
    uhuntIds.forEach(function (userId) {
        uh.userData.get(userId).then(function (data) {
            var earliestAccepted = {},
                minTimestamp = Date.now() / 1000 - numDays * 24 * 60 * 60,
                solvedLately = 0;
            data.subs.forEach(function (sub) {
                if (sub.verdict === "Accepted") {
                    earliestAccepted[sub.problemId] = sub.submitTime;
                }
            });
            Object.keys(earliestAccepted).forEach(function (problemId) {
                if (earliestAccepted[problemId] >= minTimestamp) {
                    solvedLately += 1;
                }
            });
            if (solvedLately > 0) {
                solved.push({name: data.name, numSolved: solvedLately});
            }
            
            received += 1;
            if (received === uhuntIds.length) {
                computeTable();
            }
        });
    });
}

refreshTable();
setInterval(refreshTable, refreshTime);
