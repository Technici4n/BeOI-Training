/*
	Top solvers for the home page
*/

// Main function
function top_solvers(days)
{
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
		counts.push([users[key][2], Object.keys(ac_submissions[key]).length]);
	}
	counts.sort(function(a, b)
	{
		return b[1] - a[1];
	});
	
	// 3. Create the chart
	new Chartkick.PieChart("chart-1", counts, {"library":
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
	}});
}
