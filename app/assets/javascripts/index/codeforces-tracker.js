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
	
	// CF_Users: {..., id: Codeforces handle, ...}
	
	// Problem info
	var problems; // {.., handle: [problem name, contestId, index], ...}
	
	// Problems solved by user handle.
	// {..., id: {problem_id1: 0 (for tried), problem_id2: 1 (for accepted), problem_id3: 1 (for accepted), ...}, ...}
	var problems_by_user;
	
	function send_submission_request(ruby_user_id)
	{
		var handle = cf_users[ruby_user_id];
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
	
	var ret =
	{
		// Send all request, prepare for query functions
		initialize_specific_tracker: function(callback)
		{
			// 0. Initialize al variables
			problems_by_user = JSON.parse(localStorage["codeforces_submissions"] || "{}");
			callback();
			
			// 1. Get all submissions
			var submissions_requests = [];
			for(var id in cf_users)
			{
				if(cf_users[id] && cf_users[id] != "")
					submissions_requests.push(send_submission_request(id));
			}
			
			$.when.apply($, submissions_requests).done(function()
			{
				callback();
				localStorage["codeforces_submissions"] = JSON.stringify(problems_by_user);
			});
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
