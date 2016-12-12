class RemoveMessageFromReminder < ActiveRecord::Migration[5.0]
	def change
		remove_column :reminders, :message
	end
end
