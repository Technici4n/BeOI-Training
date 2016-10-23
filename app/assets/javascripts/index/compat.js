//IE Support
if(!Date.now)
{
	Date.now = function() {return new Date().getTime();}
}