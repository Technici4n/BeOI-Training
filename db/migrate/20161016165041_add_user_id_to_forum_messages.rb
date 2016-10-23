class AddUserIdToForumMessages < ActiveRecord::Migration[5.0]
	def change
		add_column :forum_messages, :user_id, :integer
	end
end
