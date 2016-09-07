class DropDateAndTimeColumns < ActiveRecord::Migration[5.0]
	def change
		drop_table :forum_messages
		
		create_table :forum_messages do |t|
			t.string :text
			t.integer :author_id

			t.timestamps
		end
		
		remove_column :users, :inscription_date
		remove_column :subjects, :last_date
	end
end
