class AddTimeToMessage < ActiveRecord::Migration[5.0]
	def change
		add_column :forum_messages, :message_time, :time
	end
end
