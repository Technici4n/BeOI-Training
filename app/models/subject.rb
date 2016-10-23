class Subject < ApplicationRecord
	validates :title, presence: true, length: {maximum: 80}
	
	has_many :forum_messages, dependent: :destroy
end
