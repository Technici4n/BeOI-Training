class Problemset < ApplicationRecord
	validates :title, presence: true

	has_many :problems, dependent: :destroy
end
