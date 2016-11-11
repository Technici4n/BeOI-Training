class AddVisibleToProblemsets < ActiveRecord::Migration[5.0]
	def change
		add_column :problemsets, :visible, :boolean
	end
end
