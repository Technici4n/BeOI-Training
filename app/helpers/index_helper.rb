module IndexHelper
	def self.users_to_hash(session) # Problemsets
		format = {}
		User.all.each do |u|
			format[u.id] = ["", u.uva, u.display_name, false, u.is_contestant]
		end
		if User.exists?(id: session[:user_id])
			u = User.find(session[:user_id])
			format[u.id][3] = true
		end
		return format
	end
end
