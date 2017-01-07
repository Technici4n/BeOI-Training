class UsernamesAndEmailsToLowercase < ActiveRecord::Migration[5.0]
	def change
		User.all.each do |u|
			u.update(username: u.username.downcase)
			u.update(email: u.email.downcase)
		end
	end
end
