class AddShouldNotifyNewSubjectsToUsers < ActiveRecord::Migration[5.0]
	def change
		add_column :users, :should_notify_new_subjects, :boolean

		User.all.each do |u|
			u.update(should_notify_new_subjects: false)
		end
	end
end
