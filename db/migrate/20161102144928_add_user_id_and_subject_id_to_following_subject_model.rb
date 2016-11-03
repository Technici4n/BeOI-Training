class AddUserIdAndSubjectIdToFollowingSubjectModel < ActiveRecord::Migration[5.0]
	def change
		add_column :following_subjects, :user_id, :integer
		add_column :following_subjects, :subject_id, :integer
	end
end
