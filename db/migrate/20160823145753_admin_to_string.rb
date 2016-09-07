class AdminToString < ActiveRecord::Migration[5.0]
	def up
		change_column :users, :admin, :string
	end
	
	def down
		change_column :users, :admin, :boolean
	end
end
