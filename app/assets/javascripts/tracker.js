var ids = [];
var id_reqs = [];
var last_subs = [];
var current_user_name = null;
var last_sub = 0;

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
		console.log(username);
		id_reqs.push(id_request(username[0], username[1]));
	}
}

function id_request(username, display_name)
{
	return $.getJSON("http://uhunt.felix-halim.net/api/uname2uid/{0}".f(username), function(data){ids.push([data, display_name]);});
}

function subs_request(id, display_name)
{
	return $.getJSON("http://uhunt.felix-halim.net/api/subs-user/{0}".f(id), function(data)
	{
		//var name = data["name"];
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

function last_submissions()
{
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
			top_solvers(14);
			append_submissions(20);
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

function set_problem_format(i, id)
{
	$.getJSON("http://uhunt.felix-halim.net/api/p/id/{0}".f(id), function(data)
	{
		$('#problem{0}'.f(i)).html('<a target="_blank" href="http://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem={0}">{1} - {2}</a>'.f(id, data["num"], data["title"]));
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
