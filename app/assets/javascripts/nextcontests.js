var json_requests = [];
var next_ctests = [];

var CODEFORCES_LINK = "http://codeforces.com/";

function next_contests()
{
	// Codeforces
	json_requests.push($.getJSON("http://codeforces.com/api/contest.list", parse_codeforces_response));
	
	$.when.apply($, json_requests).done(function()
	{
		next_ctests.sort(function(a, b)
		{
			return ((a[3] > b[3]) ? 1 : ((b[3] > a[3]) ? -1 : 0));
		});
		show_responses();
	});
}

function parse_codeforces_response(data)
{
	if(data["status"] == "OK")
	{
		var contests = data["result"];
		for(var i = 0; i < contests.length; ++i)
		{
			var contest = contests[i];
			if(contest["relativeTimeSeconds"] > 0)
				break;
			if(contest["type"] == "CF")
			{
				//var entry = ["Codeforces", contest["name"], timestamp_to_countdown(contest["durationSeconds"]), timestamp_to_string(contest["startTimeSeconds"]), timestamp_to_countdown(-contest["relativeTimeSeconds"])];
				var entry = ['<a target="_blank" href="{0}">Codeforces</a>'.f(CODEFORCES_LINK), contest["name"], contest["durationSeconds"], contest["startTimeSeconds"], contest["relativeTimeSeconds"]];
				next_ctests.push(entry);
			}
		}
	}
}

function show_responses()
{
	for(var i = 0; i < next_ctests.length; ++i)
	{
		var e = next_ctests[i];
		$("#nextcontests").append("<tr><td>{0}</td><td>{1}</td><td>{2}</td><td>{3}</td><td>{4}</td></tr>".f(e[0], e[1], timestamp_to_countdown(e[2]), timestamp_to_string(e[3]), timestamp_to_countdown(-e[4])));
	}
}
