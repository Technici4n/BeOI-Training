/*global JsonPromise, CachedResults*/

var uh = {
    verdicts : {
        10: "Submission error",
        15: "Can't be judged",
        20: "In queue",
        30: "Compile error",
        35: "Restricted function",
        40: "Runtime error",
        45: "Output limit",
        50: "Time limit",
        60: "Memory limit",
        70: "Wrong answer",
        80: "Presentation error",
        90: "Accepted"
    },
    langs : {
        1: "ANSI C",
        2: "Java",
        3: "C++",
        4: "Pascal",
        5: "C++11"
    },
    problemData : new CachedResults(function (problemId) {
        "use strict";
        return new JsonPromise("http://uhunt.felix-halim.net/api/p/id/" + problemId);
    }),
    userData : new CachedResults(function (userId) {
        "use strict";
        return new JsonPromise("http://uhunt.felix-halim.net/api/subs-user/" + userId)
            .then(function (result) {
                var data = {
                    name: result.name,
                    username: result.uname,
                    displayName: result.name + " (" + result.uname + ")",
                    subs: []
                };
                result.subs.forEach(function (subDesc) {
                    data.subs.push(new uh.Submission(data.name, subDesc));
                });
                // Latest submission first
                data.subs.sort(function (sub1, sub2) {
                    return sub2.id - sub1.id;
                });
                return data;
            });
    }, 2000),
    Submission : function (name, sub) {
        "use strict";
        this.id = sub[0];
        this.name = name;
        this.problemId = sub[1];
        this.verdict = uh.verdicts[sub[2]];
        this.lang = uh.langs[sub[5]];
        this.runTime = sub[3] * 0.001;
        this.submitTime = sub[4];
    }
};