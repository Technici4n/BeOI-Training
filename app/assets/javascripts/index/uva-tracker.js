/*
 * Code for the home page tracker and also for the advanced tracker
 */

/* Main code */
var UvaTracker = (function()
{
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
	var submissions; // = [..., [ruby_user_id, problem ID, verdict ID, language ID, runtime, submit time], ...]
	// Last appended submission ID
	var next_submission;
	// Problem info, to convert from problem id to problem number
	var problem_info; // ID -> Num
	var problem_info_by_id; // Num -> ID

	// Users: {..., id: [uva ID, uva username, displayname, is_current, ...], ...}
	
	// Problems solved by user id.
	// {..., id: {problem_id1: 0 (for tried), problem_id2: 1 (for accepted), problem_id3: 1 (for accepted), ...}, ...}
	var problems_by_user;

	/* HELPER FUNCTIONS */
	
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
	
	var ret = // Why is this even necessary ?????
	{
		// Fetch all submissions from all users
		last_submissions: function(callback)
		{
			// 0. Init all vars
			submissions = [];
			next_submission = 0;
			problem_info = {};
			problem_info_by_id = {};
			
			// 1. Get all UVa IDs
			var id_requests = [];
			for(var id in users)
			{
				if(users[id][1] && users[id][1] != "")
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
					problem_info_by_id[p_info[1]] = [p_info[0], p_info[2]];
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
		},
		// Add <count> submissions at the end of the "Last submissions" table
		append_submissions: function(count)
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
					rowformat = UvaUtil.get_table_row_format(s[2]);
				}
				$(html_id_last_submissions_table).append('<tr{0}><td>{1}{3}{2}</td><td>{1}{4}{2}</td><td>{1}{5}{2}</td><td>{1}{6}{2}</td><td>{1}{7}{2}</td><td>{1}{8}{2}</td></tr>'.f(
															rowformat, preformat, postformat, users[s[0]][2], UvaUtil.get_problem_format(s[1]), UvaUtil.get_verdict_format(s[2]),
															UvaUtil.get_lang_format(s[3]), UvaUtil.get_runtime_format(s[4]), timestamp_to_string(s[5])));
			}
		},
		// Show the top solvers graph. param: <contestants_only>: if true, it will only take the users marked as "contestant" into account.
		top_solvers: function(days, contestants_only)
		{
			if(contestants_only === "undefined")
				contestants_only = false;
			var mintime = $.now()/1000 - days*3600*24;
			
			// 1. Get all unique AC submissions for each user
			var ac_submissions = {};
			for(var i = 0; i < submissions.length && submissions[i][5] > mintime; ++i)
			{
				var s = submissions[i];
				if(s[2] == 90)
				{
					if(!(s[0] in ac_submissions))
					{
						ac_submissions[s[0]] = {};
					}
					ac_submissions[s[0]][s[1]] = 1;
				}
			}
			
			// 2. Count the AC submissions for each user, and then sort
			var counts = [];
			for(var key in ac_submissions)
			{
				if(!contestants_only || users[key][4] == true)
					counts.push([users[key][2], Object.keys(ac_submissions[key]).length]);
			}
			counts.sort(function(a, b)
			{
				return b[1] - a[1];
			});
			
			// 3. Create the chart
			new Chartkick.PieChart("chart-1", counts,
			{
				library:
				{
					title:
					{
					   text: "<strong>Accepted submissons over the past two weeks</strong>", // Set title
					   useHTML: true // Allow HTML in title
					},
					plotOptions:
					{
						pie:
						{
							showInLegend: true // Show legend
						}
					},
					tooltip:
					{
						formatter: function() // Change tooltip format
						{
							if(this.y > 1)
								return "<b>{0} Accepted submissions</b>".f(this.y);
							else
								return "<b>1 Accepted submission</b>";
						},
						useHTML: true // Allow HTML in tooltip
					},
					legend:
					{
						layout: "vertical", // Legend to top-left
						align: "left",
						verticalAlign: "top",
						floating: true,
						useHTML: true, // Allow HTML in legend
						labelFormatter: function() // Change label format
						{
							return "{1} ({0})".f(this.y, this.name);
						}
					}
				}
			});
		},
		// Collects all the submissions, by user ID
		initialize_specific_tracker: function()
		{
			problems_by_user = {};
			for(var i = 0; i < submissions.length; ++i)
			{
				var s = submissions[i];
				var user = s[0];
				var pid = s[1];
				var verdict = s[2];
				if(!(user in problems_by_user))
					problems_by_user[user] = {};
				var user_problems = problems_by_user[user];
				
				// Check for result
				if(verdict == 90) // Accepted
				{
					user_problems[pid] = 1;
				}
				else if(verdict != 20) // Tried but not accepted and not in queue
				{
					user_problems[pid] = user_problems[pid] || 0;
				}
			}
		},
		// 1: Accepted, 0: Tried, -1: Not tried
		get_problem_status: function(user, pid)
		{
			if(user in problems_by_user && pid in problems_by_user[user])
				return problems_by_user[user][pid];
			else
				return -1;
		},
		get_problem_info_id: function(pnum)
		{
			return problem_info_by_id[pnum];
		},
		get_problem_info_num: function(pid)
		{
			return problem_info[pid];
		},
		get_uva_problem_url: function()
		{
			return uva_problem_url;
		}
	};
	
	return ret;
})();

/* Some helper functions */
var UvaUtil = (function()
{
	var ret = 
	{
		// Returns the runtime format for the tracker
		get_runtime_format: function(runtime)
		{
			return Math.floor(runtime/1000) + "." + (runtime%1000).toString().fix_left("000", 3);
		},

		// Returns the verdict format for the tracker
		get_verdict_format: function(id)
		{
			if(id == 10)
			{
				return "<span class=\"red\">Submission error</span>";
			}
			else if(id == 15)
			{
				return "<span class=\"red\">Can't be judged</span>";
			}
			else if(id == 20 || id == 0)
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
			else if(id == 90)
			{
				return "<span class=\"green\">Accepted</span>";
			}
			else
			{
				return "Unknown verdict. Please report !";
			}
		},

		// Returns the table row format for the tracker (if the user is logged in)
		get_table_row_format: function(id)
		{
			if(id == 30 || id == 40 || id == 50 || id == 60 || id == 80)
			{
				return ' class="warning"';
			}
			else if(id == 10 || id == 15 || id == 35 || id == 70)
			{
				return ' class="danger"';
			}
			else if(id == 90)
			{
				return ' class="success"';
			}
			else
			{
				return '';
			}
		},

		// Returns the language format for the tracker
		get_lang_format: function(id)
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
		},

		// Returns the problem format for the tracker
		get_problem_format: function(problem_id)
		{
			var info = UvaTracker.get_problem_info_num(problem_id);
			return '<a target="_blank" href="{0}">{1} - {2}</a>'.f(UvaTracker.get_uva_problem_url().f(problem_id), info[0], info[1]);
		}
	};
	return ret;
})();
