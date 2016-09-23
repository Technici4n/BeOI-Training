class AddIsContestantToUsersTable < ActiveRecord::Migration[5.0]
	def change
		add_column :users, :is_contestant, :boolean
	end
end
