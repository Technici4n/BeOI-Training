class AddLastMessageToSubjects < ActiveRecord::Migration[5.0]
	def change
		add_column :subjects, :last_message_time, :datetime

		Subject.all.each do |s|
			s.update(last_message_time: s.forum_messages.last.created_at)
		end
	end
end
