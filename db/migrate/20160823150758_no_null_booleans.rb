class NoNullBooleans < ActiveRecord::Migration[5.0]
	def change
		change_column :users, :admin, :boolean, :null => false
	end
end
