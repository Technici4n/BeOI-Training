class AddAuthorToMessage < ActiveRecord::Migration[5.0]
	def change
		add_column :forum_messages, :author_id, :integer
	end
end
