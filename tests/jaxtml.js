var jaxtml_commands_trie = {};

function jaxtml(name, func, args)
{
	add_jaxtml_command(name, func, args, jaxtml_commands_trie);
}

// Add command to the command jaxtml_commands_trie
function add_jaxtml_command(name, func, args, node)
{
	if(name.length == 0)
	{
		if("fall" in node)
			console.log("JaxTML: Error, this command name is already registered, and will be overwritten.");
		node['fall'] = [func, args];
	}
	else
	{
		node[name[0]] = node[name[0]] || {};
		add_jaxtml_command(name.substring(1), func, args, node[name[0]]);
	}
}

// Compiles TeX-like code to HTML
function compile_tex(text)
{
	var context = "";
	var unmodified_trie = jaxtml_commands_trie;
	var html = "";
	var curr_node = jaxtml_commands_trie;
	for(var i = 0; i < text.length; ++i)
	{
		if(text[i] != '\\')
			html += text[i];
		else
		{
			// Begin command matching
			i++;
			if(i >= text.length)
			{
				html += "JaxTML: Error, unvalid syntax";
				break;
			}
			while(true)
			{
				if(text[i] in curr_node) // Keep going through the trie
				{
					curr_node = curr_node[text[i]];
					++i;
				}
				else // End of the match
				{
					if("fall" in curr_node) // Is there a command ending here ?
					{
						var args = curr_node.fall[1];
						var found_args = [];
						for(var j = 0; j < args.length; ++j) // Find every argument
						{
							var match = find_arg(text, i, args[j][0], args[j][1]);
							if(match[1] == -1)
								return "JaxTML: Error, around position " + match[0];
							else
							{
								found_args.push(text.substring(match[0], match[1]));
								i = match[1];
							}
						}
						html += curr_node.fall[0](found_args);
						if(args.length == 0) // If there is no argument to find, print the first char after the command
							html += text[i];
						break;
					}
					else // Unknow command, just remove it
					{
						html += "[Unknow command]";
						break;
					}
				}
			}
			curr_node = jaxtml_commands_trie;
		}
	}
	jaxtml_commands_trie = unmodified_trie;
	return html;
}

// Return value: text bounds included-excluded ("[pos1, pos2)") or [error pos, -1] if an error occured
function find_arg(text, pos, beg, end)
{
	while(beg != ' ' && is_whitespace(text[pos])) // Remove heading whitespaces
	{
		++pos;
		if(pos >= text.length) return html + "JaxTML: Error, unvalid syntax";
	}
	if(text[pos] != beg) // No match
		return [pos, -1];
	++pos;
	if(pos >= text.length) return html + "JaxTML: Error, unvalid syntax";
	var level = 1; // To detect cases like { ... {...} ... }
	var beg_match = pos;
	while(pos < text.length)
	{
		if(text[pos] == beg)
			++level;
		else if(text[pos] == end)
		{
			--level;
			if(level == 0)
				return [beg_match, pos]; // Found
		}
		++pos;
	}
	return [text.length - 1, -1]; // EOT
}

function is_whitespace(c)
{
	return c == ' ' || c == '\n' || c == '\e' || c == '\t';
}
