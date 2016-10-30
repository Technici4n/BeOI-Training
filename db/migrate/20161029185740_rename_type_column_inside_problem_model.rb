class RenameTypeColumnInsideProblemModel < ActiveRecord::Migration[5.0]
	def change
		remove_column :problems, :type
		add_column :problems, :website, :integer
	end
end
