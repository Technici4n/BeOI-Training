module ForumHelper
	def self.spoiler_code(id)
		return "<div class=\"spoiler-text\"><button id=\"spoiler_button_num#{id}\" class=\"btn btn-default spoiler-btn\" onclick=\"spoiler_click(#{id});\">Show spoiler</button><div class=\"spoiler\" id=\"spoiler_num#{id}\" data-down=\"false\">"
	end
	
	def self.end_spoiler_code
		return "</div></div>"
	end
end
