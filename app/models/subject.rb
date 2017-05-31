class Subject < ApplicationRecord
	validates :title, presence: true, length: {maximum: 60}

	has_many :forum_messages, -> { order(created_at: :asc) }, dependent: :destroy
	has_many :following_subjects, dependent: :destroy
	has_many :following_users, through: :following_subjects, source: :user

	self.per_page = 10
end
