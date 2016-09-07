class AddSubforumIdToSubjects < ActiveRecord::Migration[5.0]
	def change
		add_column :subjects, :subforum_id, :integer
	end
end
