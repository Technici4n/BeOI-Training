class AddInitialsToUserModel < ActiveRecord::Migration[5.0]
	def change
		add_column :users, :initials, :string
	end
end
