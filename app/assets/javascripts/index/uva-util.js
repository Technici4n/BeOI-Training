// Returns the runtime format for the tracker
function get_runtime_format(runtime)
{
	return Math.floor(runtime/1000) + "." + (runtime%1000).toString().fix_left("000", 3);
}

// Returns the verdict format for the tracker
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

// Returns the table row format for the tracker (if the user is logged in)
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

// Returns the language format for the tracker
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

// Returns the problem format for the tracker
function get_problem_format(problem_id)
{
	var info = problem_info[problem_id];
	return '<a target="_blank" href="{0}">{1} - {2}</a>'.f(uva_problem_url.f(problem_id), info[0], info[1]);
}
