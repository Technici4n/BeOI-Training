module UsersHelper
	def self.display_name(user)
		return ('<span class="user-displayname">' + user.display_name + '</span>').html_safe
	end
end
