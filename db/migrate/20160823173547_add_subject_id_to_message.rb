class AddSubjectIdToMessage < ActiveRecord::Migration[5.0]
	def change
		add_column :forum_messages, :subject_id, :integer
	end
end
