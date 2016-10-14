/*
 * Tracker for the home page
 */

// uHunt request URLs
if(window.location.protocol == "https:")
	var url_protocol = "https://";
else
	var url_protocol = "http://";
var uhunt_domain = url_protocol + "uhunt.onlinejudge.org/api/"
var uhunt_id_request_url = uhunt_domain + "uname2uid/{0}"; // Param: username
var uhunt_user_submissions_url = uhunt_domain + "subs-user/{0}"; // Param: user ID
var uhunt_all_problems_url = uhunt_domain + "p";

// used in uva-util.js
var uva_problem_url = "https://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem={0}";

// HTML tags IDs
var html_id_last_submissions_table = "#lastsubmissions";

// All the submissions, to be appended 20 by 20
var submissions;
// Last appended submission ID
var next_submission;
// Problem info, to convert from problem id to problem number
var problem_info;

// Users: {..., id: [uva ID, uva username, displayname, is_current, ...], ...}

// Fetch all submissions from all users
function last_submissions(callback)
{
	// 0. Init all vars
	submissions = [];
	next_submission = 0;
	problem_info = {};
	
	// 1. Get all UVa IDs
	var id_requests = [];
	for(var id in users)
	{
		id_requests.push(send_id_request(id));
	}
	
	var submissions_requests = [];
	// Add the problem info request
	submissions_requests.push($.getJSON(uhunt_all_problems_url, function(data)
	{
		for(var i = 0; i < data.length; ++i)
		{
			var p_info = data[i];
			problem_info[p_info[0]] = [p_info[1], p_info[2]];
		}
	}));
	// 2. Get all submissions
	$.when.apply($, id_requests).done(function()
	{
		for(var id in users)
		{
			var user = users[id];
			submissions_requests.push(send_submission_request(id));
		}
		
		// 3. Sort submissions by submit time and call the callback function
		$.when.apply($, submissions_requests).done(function()
		{
			submissions.sort(function(a, b)
			{
				var timea = a[5];
				var timeb = b[5];
				return ((timea < timeb) ? 1 : ((timeb < timea) ? -1 : 0));
			});
			callback();
		});
	});
}

// Add <count> submissions at the end of the "Last submissions" table
function append_submissions(count)
{
	var end = next_submission + count;
	for(; next_submission < end && next_submission < submissions.length; ++next_submission)
	{
		var s = submissions[next_submission];
		var preformat = "", postformat = "", rowformat = "";
		if(users[s[0]][3] == true)
		{
			preformat = "<strong>";
			postformat = "</strong>";
			rowformat = get_table_row_format(s[2]);
		}
		$(html_id_last_submissions_table).append('<tr{0}><td>{1}{3}{2}</td><td>{1}{4}{2}</td><td>{1}{5}{2}</td><td>{1}{6}{2}</td><td>{1}{7}{2}</td><td>{1}{8}{2}</td></tr>'.f(
													rowformat, preformat, postformat, users[s[0]][2], get_problem_format(s[1]), get_verdict_format(s[2]),
													get_lang_format(s[3]), get_runtime_format(s[4]), timestamp_to_string(s[5])));
	}
}

// Fetch single user ID
function send_id_request(ruby_user_id)
{
	return $.getJSON(uhunt_id_request_url.f(users[ruby_user_id][1]), function(data)
	{
		if(data != 0)
			users[ruby_user_id][0] = data;
	});
}

// Fetch single user submission
function send_submission_request(ruby_user_id)
{
	var user = users[ruby_user_id];
	return $.getJSON(uhunt_user_submissions_url.f(user[0]), function(data)
	{
		for(var i = 0; i < data["subs"].length; ++i)
		{
			var sub = data["subs"][i];
			submissions.push([ruby_user_id, sub[1], sub[2], sub[5], sub[3], sub[4]]);
		}
	});
}
