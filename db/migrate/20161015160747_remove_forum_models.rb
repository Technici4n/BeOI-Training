class RemoveForumModels < ActiveRecord::Migration[5.0]
	def change
		drop_table :forum_messages
		drop_table :subjects
		drop_table :subforums
	end
end
