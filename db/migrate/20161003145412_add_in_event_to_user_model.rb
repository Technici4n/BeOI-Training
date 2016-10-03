class AddInEventToUserModel < ActiveRecord::Migration[5.0]
	def change
		add_column :users, :in_event, :boolean
	end
end
