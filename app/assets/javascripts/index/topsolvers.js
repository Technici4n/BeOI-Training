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
           text: "<strong>Accepted submissons over the past two weeks</strong>",
		   useHTML: true
        },
		plotOptions:
		{
			pie:
			{
				showInLegend: true
			}
		},
		tooltip:
		{
			formatter: function()
			{
				return "<b>{0} Accepted submissions</b>".f(this.y);
			},
			useHTML: true
		},
		legend:
		{
			layout: "vertical",
			align: "left",
			verticalAlign: "top",
			floating: true,
			useHTML: true,
			labelFormatter: function()
			{
				return "{1} ({0})".f(this.y, this.name);
			}
		}
	}});
	
	/*$("chart-1").highcharts(
	{
		chart:
		{
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false,
			type: "pie"
		},
		title: 
		{
			text: "Accepted submissions over the past two weeks"
		},
		plotOptions:
		{
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false
				},
				showInLegend: true
			}
		},
		series: [
		{
			name: 'Submissions',
			colorByPoint: true,
			data: [
			{
				name: "a",
				y: 2
			},
			{
				name: "b",
				y: 1
			}]
		}]
	});*/
	
	/*$('#chart-1').highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
			credits:
			{
				enabled: false
			},
            title: {
                text: 'Browser market shares January, 2015 to May, 2015'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                name: 'Brands',
                colorByPoint: true,
                data: [{
                    name: "Microsoft Internet Explorer",
                    y: 56.33
                }, {
                    name: 'Chrome',
                    y: 24.03
                }, {
                    name: 'Firefox',
                    y: 10.38
                }, {
                    name: 'Safari',
                    y: 4.77
                }, {
                    name: 'Opera',
                    y: 0.91
                }, {
                    name: 'Proprietary or Undetectable',
                    y: 0.2
                }]
            }]
        });*/
}
