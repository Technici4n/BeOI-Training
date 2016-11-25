/* Parser code */
var BBCodeParser = 
{
	tags: {}, // {..., tag: [callback, need_closing_tag?, no_inside_parsing?]}
	str: "", // Unparsed text
	text: [], // Parsed text
	errors: false,
	add_tag: function(tag, callback, need_closing_tag, no_inside_parsing)
	{
		if(no_inside_parsing == undefined) // Check for optional parameters
		{
			no_inside_parsing = false;
			if(need_closing_tag == undefined)
				need_closing_tag = true;
		}
		BBCodeParser.tags[tag] = [callback, need_closing_tag, no_inside_parsing];
	},
	match_tag: function(pos)
	{
		var str = BBCodeParser.str;
		var matched = [];
		while(pos < str.length && str[pos] != ']' && str[pos] != '=') // Basically allow any character
		{
			matched.push(str[pos]);
			++pos;
		}
		return [pos, matched.join('')];
	},
	match_arg: function(pos)
	{
		var str = BBCodeParser.str;
		var matched = [];
		while(pos < str.length && str[pos] != ']') // Basically allow any character
		{
			matched.push(str[pos]);
			++pos;
		}
		return [pos, matched.join('')];
	},
	parse: function(unparsed) // All the "Check" are useless, because unvalid "pos" value always throws an exception later.
	{
		BBCodeParser.errors =  false;
		try
		{
			BBCodeParser.str = unparsed;
			BBCodeParser.text = [];
			var str = BBCodeParser.str;
			var pos = 0;
			var stack = [];
			while(pos < str.length)
			{
				if(str[pos] != '[')
				{
					BBCodeParser.text.push(str[pos]);
					++pos;
				}
				else
				{
					++pos; // Check
					if(str[pos] == '/') // Closing tag
					{
						++pos;
						var match = BBCodeParser.match_tag(pos);
						pos = match[0]; // Check
						if(str[pos] == ']' && match[1] in BBCodeParser.tags) // Does this tag exist ?
						{
							if(stack.length <= 0)
								throw 'Unexpected closing tag: "/{0}".'.f(match[1]);
							var top = stack.pop();
							if(top[0] == match[1]) // Is this tag correctly aligned ?
							{
								BBCodeParser.text.push(top[1]); // Add appended BBCodeParser.text at the end
								++pos;
								continue;
							}
						}
						// If we reach this context, an error has occurred
						throw 'Unexisting, incomplete or misaligned closing tag: "/{0}".'.f(match[1]);
					}
					else // Opening tag
					{
						var match = BBCodeParser.match_tag(pos);
						var cmd = match[1], arg;
						pos = match[0]; // Check
						if(str[pos] == '=') // Is there an argument for this tag ?
						{
							++pos;
							match = BBCodeParser.match_arg(pos);
							pos = match[0]; // Check
							arg = match[1];
						}
						if(str[pos] == ']' && cmd in BBCodeParser.tags) // Does this tag exist ?
						{
							++pos; // Check
							var info = BBCodeParser.tags[cmd];
							var formatted_text = info[0](arg);
							BBCodeParser.text.push(formatted_text[0]); // Add beginning text
							if(info[1]) // Need closing tag ?
							{
								// Add it to the stack
								stack.push([cmd, formatted_text[1]]);
								if(info[2]) // Avoid matching inside ?
								{
									var old_pos = pos;
									// Then just jump to the next closing tag :D (TODO: (Maybe) KMP) (Maybe...)
									var query = "[/{0}]".f(cmd);
									for(; pos < str.length; ++pos)
									{
										var ok = true;
										for(var beg = 0; beg < query.length && beg + pos < str.length && ok; ++beg)
										{
											ok = (query[beg] == str[pos + beg]);
										}
										if(ok)
										{
											break;
										}
									}
									BBCodeParser.text.push(str.substring(old_pos, pos));
								}
							}
							continue;
						}
						// If we reach this context, an error has occurred
						throw 'Unexisting or incomplete opening tag: "{0}".'.f(cmd);
					}
				}
			}
			if(stack.length > 0)
			{
				stack.reverse();
				var tags = [];
				for(var i = 0; i < stack.length; ++i)
				{
					tags.push('"{0}"'.f(stack[i][0]));
				}
				throw 'Missing {0} closing tag(s): {1}.'.f(stack.length, tags.join(','));
			}
		}
		catch(err)
		{
			BBCodeParser.errors = true;
			BBCodeParser.text = ['<span class="red">Error: {0}</span>'.f(err)];
		}
		finally
		{
			return BBCodeParser.text.join('');
		}
	}
};

// Spoilers
var spoiler_id = 0;

/* Add default tags */
BBCodeParser.add_tag("b", function(){return ['<span class="bb-{0}">'.f("b"), '</span>']});
BBCodeParser.add_tag("i", function(){return ['<span class="bb-{0}">'.f("i"), '</span>']});
BBCodeParser.add_tag("u", function(){return ['<span class="bb-{0}">'.f("u"), '</span>']});
BBCodeParser.add_tag("s", function(){return ['<span class="bb-{0}">'.f("s"), '</span>']});
BBCodeParser.add_tag("color", function(arg){return ['<span style="color: {0};">'.f(arg),'</span>']});
BBCodeParser.add_tag("url", function(arg){if(arg == undefined){return ['<a class="bbcode-incomplete-url" target="_blank">', '</a>']} else {return ['<a target="_blank" href="{0}">'.f(arg), '</a>']}}, true, true);
BBCodeParser.add_tag("code", function(arg){if(arg && arg == "inline"){return ['<code>', '</code>']}else{return ['<pre class="prettyprint lang-{0}">'.f(arg), '</pre>']}}, true, true);
BBCodeParser.add_tag("spoiler", function(){return ['<button id="spoiler_button_num{0}" class="btn btn-default spoiler-btn" onclick="spoiler_click({0});">Show spoiler</button><br><div class="spoiler" id="spoiler_num{0}" data-down="false" style="visibility:hidden; position:absolute;">'.f(spoiler_id++), '</div>']});
BBCodeParser.add_tag("uva", function(arg){return [UvaTracker.get_problem_format(arg)]}, false);

/* Add smileys */
function get_smiley_callback(unicode, alt)
{
	return function() {return ['<img alt="{0}" class="smiley" src="/smileys/{1}.svg">'.f(alt, unicode)]};
}
// All registered smileys
var smileys =
{
	"1f600": [":D", ":-D", "veryhappy"],
	"1f607": ["o)", "O)", "o-)", "O-)", "angel"],
	"1f608": ["3-[", "3[", "3-)", "3)", "devil"],
	"1f609": [";)", ";-)", "wink"],
	"1f610": [":|", ":-|", "-_-", "neutral"],
	"1f61b": [":P", ":p", ":-P", ":-p", "tongue"],
	"1f61e": [":(", ":-(", "sad"],
	"1f62d": [":'(", ":&#39;(", "crying"],
	"1f632": [":o", ":O", ":-o", ":-O", "oh"],
	"1f642": [":)", ":-)", "happy"]
};
for(var key in smileys)
{
	var alts = smileys[key];
	for(var i = 0; i < alts.length; ++i)
	{
		var alt = alts[i];
		BBCodeParser.add_tag(alt, get_smiley_callback(key, alt), false);
	}
}

// Post-process all the link tags, necessary to keep the parser O(n)
function update_urls()
{
	$(".bbcode-incomplete-url").each(function(index)
	{
		$(this).attr("href", $(this).html());
		$(this).removeClass("bbcode-incomplete-url");
	});
}

$(function() // Auto-parse BBCode once the page is loaded
{
	$(".bb-code").each(function(index)
	{
		$(this).attr("data-swapped", $(this).html());
		$(this).html(BBCodeParser.parse($(this).html()));
	});
	update_urls();
});