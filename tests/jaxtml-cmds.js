jaxtml("begin", tex_begin, [["{", "}"]]);
jaxtml("end", tex_end, [["{", "}"]]);
jaxtml("\\", tex_backslash, []);

// All base format-related commands
var base_cmds = [
	["textbf", "span", "textbf"]
];
for(var i = 0; i < base_cmds.length; ++i)
{
	var cmd = base_cmds[i];
	add_css_function(cmd[0], cmd[1], cmd[2], true);
}

var base_unmatch_cmds = [
	["title", "h1", "title"],
	["section", "h2", "section"],
	["frametitle", "h3", "frametitle"]
];
for(var i = 0; i < base_unmatch_cmds.length; ++i)
{
	var cmd = base_unmatch_cmds[i];
	add_css_function(cmd[0], cmd[1], cmd[2], false)
}

function add_css_function(latex, tag, css_class, submatch)
{
	jaxtml(latex, function (args)
	{
		return '<{0} class="{1}">{2}</{0}>'.f(tag, css_class, (submatch) ? compile_tex(args[0]) : args[0]);
	}, [["{", "}"]]);
}

function tex_begin(args)
{
	switch(args[0])
	{
	case "frame":
		context = "frame";
		return '<div class="frame">';
		
	case "center":
		return '<div class="center">';
		
	default:
		return "";
	}
}

function tex_end(args)
{
	switch(args[0])
	{
	case "frame":
		context = "";
		return '</div>';
		
	case "center":
		return '</div>';
	
	default:
		return "";
	}
}

function tex_backslash(args)
{
	if(context == "frame")
		return '<br>'
	else
		return '';
}
