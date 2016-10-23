class AddViewsAndStatusBitmaskToSubject < ActiveRecord::Migration[5.0]
	def change
		add_column :subjects, :views, :integer
		add_column :subjects, :status, :integer
	end
end
