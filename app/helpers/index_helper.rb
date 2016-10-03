require "net/http"

module IndexHelper
	def self.format_users_to_js
		format = []
		User.all.each do |u|
			format << [u.uva, u.display_name, u.is_contestant]
		end
		return format
	end
	def self.uva_update_submissions
		last_subs = uva_fetch_last_submissions(1)
		if LastSubmission.last == nil || last_subs[0][0] != LastSubmission.last.submission_id
			last_subs = uva_fetch_last_submissions(500)
			LastSubmission.destroy_all
			last_subs[0..499].reverse.each do |s|
				puts s[4]
				ls = LastSubmission.new
				ls.submission_id = s[0]
				ls.username = s[7]
				ls.problem = s[1]
				ls.verdict = s[2]
				ls.lang = s[5]
				ls.time = s[3]
				ls.submit_time = s[4]
				ls.save
			end
		end
		return LastSubmission.all.reverse
	end
	# Sends an HTTP request
	def self.http_request(dns)
		url = URI.parse(dns)
		request = Net::HTTP::Get.new(url.to_s)
		return Net::HTTP.start(url.host, url.port) {|http| http.request(request)}
	end
	# Returns the UVa ID with the UVa username
	def self.uva_fetch_id(username)
		return http_request("http://uhunt.felix-halim.net/api/uname2uid/#{username}").body
	end
	# Returns the UVa IDs of all Users
	def self.uva_fetch_ids
		user_ids = []
		User.all.each do |u|
			user_ids.push(uva_fetch_id(u.uva))
		end
		user_ids.reject!{|id| id == "0"}
		return user_ids
	end
	# Returns the last #{subcnt} submissions for all the users, sorted by time
	def self.uva_fetch_last_submissions(subcnt)
		user_ids = uva_fetch_ids
		last_subs = []
		User.all.each do |u|
			id = uva_fetch_id(u.uva)
			result = http_request("http://uhunt.felix-halim.net/api/subs-user-last/#{id}/#{subcnt}")
			parsed = JSON.parse(result.body.to_s)
			subs = parsed["subs"]
			subs.each do |sub|
				sub << u.username
				last_subs << sub
			end
		end
		return last_subs.sort_by{|sub| -sub[4]}
	end
	# Returns info for a problem ID
	def self.uva_fetch_problem_info(id)
		return JSON.parse(http_request("http://uhunt.felix-halim.net/api/p/id/#{id}").body)
	end
	# @param max_time: Over how many days ?
	def self.uva_fetch_accepted_submissions(id, max_time)
		limit = Time.now.to_i - max_time*86400
		count = 0
		subs = JSON.parse(http_request("http://uhunt.felix-halim.net/api/subs-user/#{id}").body)["subs"]
		subs.each do |s|
			if s[2] == 90 && s[4] > limit
				count += 1
			end
		end
		return count
	end
	# Returns the HTML formatted text for a verdict ID
	def self.uva_get_verdict_format(id)
		if id == 10
			return "<span class=\"red\">Submission error</span>"
		elsif id == 15
			return "<span class=\"red\">Can't be judged</span>"
		elsif id == 20
			return "In judge queue"
		elsif id == 30
			return "<span class=\"orange\">Compile error</span>"
		elsif id == 35
			return "<span class=\"red\">Restricted function</span>"
		elsif id == 40
			return "<span class=\"orange\">Runtime error</span>"
		elsif id == 45
			return "Output limit"
		elsif id == 50
			return "<span class=\"orange\">Time limit exceeded</span>"
		elsif id == 60
			return "<span class=\"orange\">Memory limit</span>"
		elsif id == 70
			return "<span class=\"red\">Wrong answer</span>"
		elsif id == 80
			return "<span class=\"orange\">Presentation error</span>"
		else
			return "<span class=\"green\">Accepted</span>"
		end
	end
	# Returns the HTML formatted text for a language ID
	def self.uva_get_language_format(id)
		if id == 1
			return "ANSI C (C90)"
		elsif id == 2
			# Yes, Java is evil...
			return "<span class=\"red\">Java</span>"
		elsif id == 3
			return "C++"
		elsif id == 4
			# And please, don't use Pascal...
			return "<span class=\"orange\">Pascal</span>"
		elsif id == 5
			return "C++11"
		else
			return "Python3"
		end
	end
	# Returns the HTML formatted text for a problem ID
	def self.uva_get_problem_format(id)
		info = uva_fetch_problem_info(id)
		return "<a target=\"_blank\" href=\"http://uva.onlinejudge.org/index.php?option=com_onlinejudge&Itemid=8&page=show_problem&problem=#{id}\">#{info["num"]} - #{info["title"]}</a>"
	end
	def self.uva_get_submission_table_line_format(id)
		if id == 90
			return " class=success"
		elsif id == 10 || id == 15 || id == 35 || id == 70
			return " class=danger"
		elsif id == 20 || id == 45
			return ""
		else
			return " class=warning"
		end
	end
end
