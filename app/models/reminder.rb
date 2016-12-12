class Reminder < ApplicationRecord
	validates :title, length: {:in => 1..40}
	validates :description, presence: true
	validates :time, presence: true
end
