/*var ids;
var id_reqs;
var last_subs;
var current_user_name;
var last_sub;

// Sign Up form only !!
function fetch_uva_id()
{
	if($('#user_uva').val() != "")
	{
		$.getJSON("http://uhunt.felix-halim.net/api/uname2uid/{0}".f($('#user_uva').val()), function (data)
		{
			if(data != 0)
			{
				$.getJSON("http://uhunt.felix-halim.net/api/subs-user-last/{0}/0".f(data), function (data2)
				{
					$('#user_display_name').val(data2["name"]);
				});
			}
		});
	}
}

function top_solvers(days)
{
	var mintime = $.now()/1000 - days*3600*24;
	var dict = {};
	var count = {};
	for(var i = 0; i < last_subs.length && last_subs[i][5] > mintime; ++i)
	{
		var sub = last_subs[i];
		if(sub[2] != 90)
		{
			continue;
		}
		if(dict[sub[0]] == undefined)
		{
			dict[sub[0]] = {};
		}
		if(dict[sub[0]][sub[1]] == undefined)
		{
			dict[sub[0]][sub[1]] = 1;
			if(count[sub[0]] == undefined)
			{
				count[sub[0]] = 0;
			}
			count[sub[0]]++;
		}
	}
	
	// Convert the "array" to a true array and then sort it
	var top_solvers = [];
	var sum = 0;
	for(var key in count)
	{
		top_solvers.push([key, count[key]]);
		sum += count[key];
	}
	
	top_solvers.sort(function(a, b)
	{
		return ((a[1] < b[1]) ? 1 : ((b[1] < a[1]) ? -1 : 0));
	});
	
	// Add the rows to the table
	// And build pie chart
	var chart_data = [];
	for(var i = 0; i < top_solvers.length; ++i)
	{
		var curr = top_solvers[i];
		var str = "" + Math.round(curr[1]/sum * 10000)/100;
		var beformat = "", aftermat = "", row_format = "";
		if(curr[0] == current_user_name)
		{
			beformat = '<strong>';
			aftermat = '</strong>';
			row_format = ' class="info"'
		}
		chart_data.push([curr[0], curr[1]]);
		str += " %";
		$('#topsolvers').append('<tr {5}><td>{3}{0}{4}</td><td>{3}{1}{4}</td><td>{3}{2}{4}</td></tr>'.f(curr[0], curr[1], str, beformat, aftermat, row_format));
		new Chartkick.PieChart("chart-1", chart_data);
	}
}

function compare_subs_by_timestamp(a, b)
{
	var timea = a[5];
	var timeb = b[5];
	return ((timea < timeb) ? 1 : ((timeb < timea) ? -1 : 0));
}

function fetch_ids()
{
	for(var i = 0; i < usernames.length; ++i)
	{
		var username = usernames[i];
		id_reqs.push(id_request(username[0], username[1], username[2]));
	}
}

function id_request(username, display_name, is_contestant)
{
	return $.getJSON("http://uhunt.felix-halim.net/api/uname2uid/{0}".f(username), function(data){ids.push([data, display_name, is_contestant]);});
}

function subs_request(id, display_name)
{
	return $.getJSON("http://uhunt.felix-halim.net/api/subs-user/{0}".f(id), function(data)
	{
		var name = display_name;
		if(data["uname"] == current_user)
		{
			current_user_name = name;
		}
		$.each(data["subs"], function(i, sub)
		{
			var formatted_sub = [name, sub[1], sub[2], sub[5], sub[3], sub[4]];
			last_subs.push(formatted_sub);
		});
	});
}

function last_submissions(callback)
{
	// Have to reset the global variables every time to prevent duplicates
	// Moral: don't use global variables ;)
	ids = [];
	id_reqs = [];
	last_subs = [];
	current_user_name = null;
	last_sub = 0;

	fetch_ids();
	$.when.apply($, id_reqs).done(function()
	{
		var subs_req = [];
		for(var i = 0; i < ids.length; ++i)
		{
			subs_req.push(subs_request(ids[i][0], ids[i][1]));
		}
		
		$.when.apply($, subs_req).done(function()
		{
			last_subs.sort(compare_subs_by_timestamp);
			callback();
		});
	});
}

function append_submissions(count)
{
	var end = last_sub + count;
	for(; last_sub < end && last_sub < last_subs.length; ++last_sub)
	{
		var s = last_subs[last_sub];
		var beformat = "", aftermat = "", row_format = "";
		if(s[0] == current_user_name)
		{
			beformat = "<strong>";
			aftermat = "</strong>";
			row_format = get_table_row_format(s[2]);
		}
		$('#lastsubmissions').append('<tr{9}><td>{7}{0}{8}</td><td>{7}<span id="problem{6}">{1}</span>{8}</td><td>{7}{2}{8}</td><td>{7}{3}{8}</td><td>{7}{4}{8}</td><td>{7}{5}{8}</td></tr>'.f(s[0], s[1], get_verdict_format(s[2]), get_lang_format(s[3]), get_runtime_format(s[4]), timestamp_to_string(s[5]), last_sub, beformat, aftermat, row_format));
		set_problem_format(last_sub, s[1]);
	}
}

// By problem ID!
function set_problem_format(i, id)
{
	$.getJSON("http://uhunt.felix-halim.net/api/p/id/{0}".f(id), function(data)
	{
		$('#problem{0}'.f(i)).html('<a target="_blank" href="http://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem={0}">{1} - {2}</a>'.f(id, data["num"], data["title"]));
	});
}

// By problem NUMBER!!
function set_problem_format_by_id(i, num)
{
	$.getJSON("http://uhunt.felix-halim.net/api/p/num/{0}".f(num), function(data)
	{
		$('#problem{0}'.f(i)).html('<a target="_blank" href="http://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem={0}">{1} - {2}</a>'.f(data["pid"], data["num"], data["title"]));
	});
}

function get_runtime_format(runtime)
{
	return Math.floor(runtime/1000) + "." + (runtime%1000).toString().fix_left("000", 3);
}

function get_verdict_format(id)
{
	if(id == 10)
	{
		return "<span class=\"red\">Submission error</span>";
	}
	else if(id == 15)
	{
		return "<span class=\"red\">Can't be judged</span>";
	}
	else if(id == 20)
	{
		return "In judge queue";
	}
	else if(id == 30)
	{
		return "<span class=\"orange\">Compile error</span>";
	}
	else if(id == 35)
	{
		return "<span class=\"red\">Restricted function</span>";
	}
	else if(id == 40)
	{
		return "<span class=\"orange\">Runtime error</span>";
	}
	else if(id == 45)
	{
		return "Output limit";
	}
	else if(id == 50)
	{
		return "<span class=\"orange\">Time limit exceeded</span>";
	}
	else if(id == 60)
	{
		return "<span class=\"orange\">Memory limit</span>";
	}
	else if(id == 70)
	{
		return "<span class=\"red\">Wrong answer</span>";
	}
	else if(id == 80)
	{
		return "<span class=\"orange\">Presentation error</span>";
	}
	else
	{
		return "<span class=\"green\">Accepted</span>";
	}
}

function get_table_row_format(id)
{
	if(id == 30 || id == 40 || id == 50 || id == 60 || id == 80)
	{
		return ' class="warning"';
	}
	else if(id == 10 || id == 15 || id == 35 || id == 70)
	{
		return ' class="danger"';
	}
	else if(id == 20 || id == 45)
	{
		return '';
	}
	else
	{
		return ' class="success"';
	}
}

function get_lang_format(id)
{
	if(id == 1)
	{
		return "C90";
	}
	else if(id == 2)
	{
		return "<span class=\"orange\">Java</span>";
	}
	else if(id == 3)
	{
		return "C++";
	}
	else if(id == 4)
	{
		return "<span class=\"orange\">Pascal</span>";
	}
	else if(id == 5)
	{
		return "C++11";
	}
	else
	{
		return "Python 3";
	}
}

var eventusers, contestants, others;
var contestants_subs, others_subs;
var problem_num_to_id;
var contestants_accepteds;
var others_accepteds;

function show_tracked_problems()
{
	// 1. Show(ed) problem information
	var pids = tracked_problems.split(",");
	// To make sure that 300 goes before 1000
	for(var i = 0; i < pids.length; ++i)
	{
		pids[i] = pids[i].fix_left("00000000", 5);
	}
	pids.sort();
	
	// 2. Get user submissions
	id_reqs = [];
	ids = [];
	contestants = []; others = [];
	problem_num_to_id = {};
	contestants_accepteds = {};
	others_accepteds = {};
	contestants_subs = []; others_subs = []; // [ [username, problem1 solved ?, problem2 solved ?, ..., total solved], ... ]
	
	fetch_ids();
	
	// Let's create the table
	var buff = '<tr><th>User</th>';
	for(var i = 0; i < pids.length; ++i)
		buff += '<th>{0}</th>'.f(parseInt(pids[i]).toString());
	buff += '<th>Total</th></tr>';
	$('#contestant-submissions thead').append(buff);
	$('#others-submissions thead').append(buff);
	
	// JSON requests
	$.when.apply($, id_reqs).done(function()
	{
		$.getJSON("http://uhunt.felix-halim.net/api/p", function(data)
		{
			for(var i = 0; i < data.length; ++i)
				problem_num_to_id[data[i][1].toString().fix_left("00000", 5)] = data[i][0];
			
			var id_reqs = [];
			
			var reqs = [];
			var problems = [];
			
			for(var i = 0; i < pids.length; ++i)
				problems.push(problem_num_to_id[pids[i]]);
			
			for(var i = 0; i < ids.length; ++i)
			{
				if(ids[i][2] == true)
					contestants.push(ids[i]);
				else
					others.push(ids[i]);
				
				reqs.push(adv_sub_req(problems, ids[i]));
			}
			
			$.when.apply($, reqs).done(function()
			{
				contestants_subs.sort();
				for(var i = 0; i < contestants_subs.length; ++i)
				{
					var buff = "<tr>";
					for(var j = 0; j < contestants_subs[i].length; ++j)
						buff += "<td>{0}</td>".f(contestants_subs[i][j]);
					buff += "</tr>";
					$('#contestant-submissions tbody').append(buff);
				}
				
				others_subs.sort();
				for(var i = 0; i < others_subs.length; ++i)
				{
					var buff = "<tr>";
					for(var j = 0; j < others_subs[i].length; ++j)
						buff += "<td>{0}</td>".f(others_subs[i][j]);
					buff += "</tr>";
					$('#others-submissions tbody').append(buff);
				}
				
				for(var i = 0; i < pids.length; ++i)
				{
					$('#tracked-problems').append('<tr><td><strong id="problem{0}">{1}</strong></td><td>{2}</td><td>{3}</td></tr>'.f(i, pids[i],
					'<strong>{0}/{1}</strong>'.f(contestants_accepteds[problem_num_to_id[pids[i]].toString().fix_left("000000", 5)] || 0, contestants_subs.length),
					'<strong>{0}/{1}</strong>'.f(others_accepteds[problem_num_to_id[pids[i]].toString().fix_left("000000", 5)] || 0, others_subs.length)));
					set_problem_format_by_id(i, pids[i]);
				}
			});
		});
	});
}

function adv_sub_req(problems, user)
{
	return $.getJSON("http://uhunt.felix-halim.net/api/subs-pids/{0}/{1}/0".f(user[0], problems.toString()), function(data)
	{
		var dat = data[user[0]];
		var subs = dat["subs"];
		var entry = ["<strong>{0}</strong>".f(user[1])];
		var total = 0;
		var dict = {};
		var tries = {};
		for(var i = 0; i < subs.length; ++i)
		{
			if(subs[i][2] == 90)
			{
				if(!(subs[i][1].toString().fix_left("000000", 5) in dict))
				{
					dict[subs[i][1].toString().fix_left("000000", 5)] = 1;
					++total;
					if(user[2] == true)
						contestants_accepteds[subs[i][1].toString().fix_left("00000", 5)] = ++contestants_accepteds[subs[i][1].toString().fix_left("00000", 5)] || 1;
					else
						others_accepteds[subs[i][1].toString().fix_left("00000", 5)] = ++others_accepteds[subs[i][1].toString().fix_left("00000", 5)] || 1;
				}
			}
			if(!(subs[i][1].toString().fix_left("000000", 5) in tries))
				tries[subs[i][1].toString().fix_left("000000", 5)] = 0;
			++tries[subs[i][1].toString().fix_left("000000", 5)];
		}
		for(var i = 0; i < problems.length; ++i)
		{
			if(problems[i].toString().fix_left("000000", 5) in dict)
				entry.push('<strong class="green">Solved</strong>');
			else if(problems[i].toString().fix_left("000000", 5) in tries)
				entry.push('<strong class="orange">Tried({0})</strong>'.f(tries[problems[i].toString().fix_left("000000", 5)]));
			else
				entry.push('');
		}
		if(total > 0)
			entry.push('<strong>{0}</strong>'.f(total));
		else
			entry.push('');
		if(user[2] == true)
			contestants_subs.push(entry);
		else
			others_subs.push(entry);
	});
}*/