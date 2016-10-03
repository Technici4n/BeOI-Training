class AddEnabledToEventModel < ActiveRecord::Migration[5.0]
	def change
		add_column :events, :disabled, :boolean
	end
end
