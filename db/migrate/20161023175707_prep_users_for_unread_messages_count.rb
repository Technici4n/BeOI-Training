class PrepUsersForUnreadMessagesCount < ActiveRecord::Migration[5.0]
	def change
		add_column :users, :last_forum_visit, :datetime
		add_column :users, :unread_subjects, :integer
	end
end
