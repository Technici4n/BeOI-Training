class ForumMessage < ApplicationRecord
	validates :text, presence: true, length: {maximum: 8192}

	belongs_to :subject
	belongs_to :user
end
