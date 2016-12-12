var CodeforcesTracker = (function()
{
	if(window.location.protocol == "https:")
	{
		var codeforces_user_submissions_url = "/codeforces?method=user.status?handle={0}";
		var codeforces_all_problems_url = "/codeforces?method=problemset.problems";
	}
    else
	{
		var codeforces_user_submissions_url = "http://codeforces.com/api/user.status?handle={0}&jsonp=?";
		var codeforces_all_problems_url = "http://codeforces.com/api/problemset.problems?jsonp=?";
	}
	var codeforces_problem_url = "http://codeforces.com/problemset/problem/{0}/{1}";

	// cf_users: {..., id: Codeforces handle, ...}

	// localStorage["codeforces_user_updates"]: [..., [last update, id, Codeforces handle], ...]

	// Problem info
	var problems; // {.., handle: [problem name, contestId, index], ...}

	// Problems solved by user handle.
	// {..., id: {problem_id1: 0 (for tried), problem_id2: 1 (for accepted), problem_id3: 1 (for accepted), ...}, ...}
	var problems_by_user;

	// Update one user's data, by sending a request to Codeforces
	function send_submission_request(ruby_user_id, handle)
	{
		return $.getJSON(codeforces_user_submissions_url.f(handle), function(data)
		{
			if(data["status"] === "OK")
			{
				if(!(ruby_user_id in problems_by_user)) // Create if doesn't exist yet
					problems_by_user[ruby_user_id] = {};
				var user_problems = problems_by_user[ruby_user_id];
				data = data["result"];
				for(var i = 0; i < data.length; ++i) // For each submission
				{
					var sub = data[i];
					if(sub["testset"] === "TESTS" && sub["verdict"]) // Only on "true" tests
					{
						var problem_handle = sub["problem"]["contestId"] + sub["problem"]["index"];
						if(sub["verdict"] === "OK") // Accepted
						{
							user_problems[problem_handle] = 1;
						}
						else if(sub["verdict"] !== "TESTING") // Failed
						{
							user_problems[problem_handle] = user_problems[problem_handle] || 0;
						}
					}
				}
			}
		});
	}

	// Update user data
	function update_users(callback)
	{
		if(localStorage["codeforces_last_update"] + 60 > Math.floor(Date.now() / 1000)) // Make sure there was no update done in the previous minutes
		{
			setInterval(function(){update_users(callback);}, 2*60*1000);
			return;
		}
		// Get saved data
		var users_data = JSON.parse(localStorage["codeforces_user_updates"] || "[]");
		var sorted_data = users_data.sort();
		var update_requests = [];
		for(var i = 0; i < 2 && i < sorted_data.length; ++i)
		{
			// Send request
			update_requests.push(send_submission_request(sorted_data[i][1], sorted_data[i][2]));
			// Update user's timestamp
			sorted_data[i][0] = Math.floor(Date.now() / 1000);
		}
		// Just update submissions and user data
		$.when.apply($, update_requests).done(function()
		{
			// Save result
			localStorage["codeforces_submissions"] = JSON.stringify(problems_by_user);
			localStorage["codeforces_user_updates"] = JSON.stringify(sorted_data);

			callback();

			// Repeat every 2 minutes
			setInterval(function(){update_users(callback);}, 2*60*1000);
		});
	}

	// Update users from cf_users if available
	function update_user_list()
	{
		if(typeof cf_users !== 'undefined')
		{
			var users_data = JSON.parse(localStorage["codeforces_user_updates"] || "[]");
			for(var i = 0; i < users_data.length; ++i)
			{
				var id = users_data[i][1];
				if(id in cf_users)
				{
					cf_users[id] = [cf_users[id], users_data[i][0]];
				}
			}
			users_data = [];
			for(var id in cf_users)
			{
				if(typeof cf_users[id] !== 'object')
				{
					cf_users[id] = [cf_users[id], Math.floor(Date.now() / 1000)];
				}
				users_data.push([cf_users[id][1], id, cf_users[id][0]]);
			}
			localStorage["codeforces_user_updates"] = JSON.stringify(users_data);
		}
	}

	var ret =
	{
		// Update and load data for queries
		initialize_specific_tracker: function(callback)
		{
			// 0. Initialize al variables
			update_user_list();
			problems_by_user = JSON.parse(localStorage["codeforces_submissions"] || "{}");
			callback();

			// 1. Get some new submission if HTTP is being used
			if(window.location.protocol != "https:")
			{
				update_users(callback);
			}
		},
		// Prepare for problem info queries (very long so it's separated)
		initialize_problem_info: function(callback)
		{
			problems = JSON.parse(localStorage["codeforces_problems"] || "{}");
			callback();
			$.getJSON(codeforces_all_problems_url, function(data)
			{
				if(data["status"] === "OK")
				{
					data = data["result"]["problems"];
					for(var i = 0; i < data.length; ++i)
					{
						var pb = data[i];
						var handle = pb["contestId"] + pb["index"];
						problems[handle] = [pb["name"], pb["contestId"], pb["index"]];
					}
					callback();
					localStorage["codeforces_problems"] = JSON.stringify(problems);
				}
			});
		},
		// 1: Accepted, 0: Tried, -1: Not tried
		get_problem_status: function(user, handle)
		{
			if(user in problems_by_user && handle in problems_by_user[user])
				return problems_by_user[user][handle];
			else
				return -1;
		},
		// Get the problem format
		get_problem_format: function(handle)
		{
			if(handle in problems)
				return '<a target="_blank" href="{0}">{1} - {2}</a>'.f(codeforces_problem_url.f(problems[handle][1], problems[handle][2]), handle, problems[handle][0]);
			else
				return null;
		}
	};
	return ret;
})();
