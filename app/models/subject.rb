class Subject < ApplicationRecord
	has_many :forum_messages, dependent: :destroy
	belongs_to :subforum
end
