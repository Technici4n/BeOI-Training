String.prototype.format = String.prototype.f = function()
{
	var s = this, i = arguments.length;
	while(i--)
	{
		s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
	}
	return s;
};

String.prototype.split = function(c)
{
	var ans = [];
	var curr = "";
	for(var i = 0; i < this.length; ++i)
	{
		if(this[i] == c)
		{
			if(curr != "")
				ans.push(curr);
			curr = "";
		}
		else
		{
			curr += this[i];
		}
	}
	if(curr != "")
		ans.push(curr)
	return ans;
};

String.prototype.fix_left = function(str, padding)
{
	return String(str + this).slice(-padding);
};

function timestamp_to_string(timestamp)
{
	var date = new Date(timestamp*1000);
	return '{0}-{1}-{2}, at {3}:{4}:{5}'.f(date.getYear() + 1900, (date.getMonth() + 1).toString().fix_left("00", 2), date.getDate().toString().fix_left("00", 2), date.getHours().toString().fix_left("00", 2), date.getMinutes().toString().fix_left("00", 2), date.getSeconds().toString().fix_left("00", 2));
}

function timestamp_to_countdown(timestamp)
{
	var ans = "";
	if(timestamp > 60*60*24)
	{
		ans += "{0}d ".f(Math.floor(timestamp/(60*60*24)));
		timestamp %= 60*60*24;
	}
	if(timestamp > 60*60)
	{
		ans += "{0}h ".f(Math.floor(timestamp/(60*60)));
		timestamp %= 60*60;
	}
	if(timestamp > 60)
	{
		ans += "{0}m ".f(Math.floor(timestamp/(60)));
		timestamp %= 60;
	}
	if(timestamp > 0)
	{
		ans += "{0}s ".f(Math.floor(timestamp));
	}
	return ans;
}

/*
function binary_search(array, el)
{
	var lo = 0, hi = array.length - 1;
	while(lo <= hi)
	{
		// a | b = Math.floor(a)
		// Fuck this implicit cast...
		var mid = (lo + hi) / 2 | 0;
		if(array[mid] == el)
			return mid;
		else if(array[mid] < el)
			lo = mid + 1;
		else
			hi = mid - 1;
	}
	return -1;
}*/
