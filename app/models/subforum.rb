class Subforum < ApplicationRecord
	has_many :subjects, dependent: :destroy
	
	validates :title, :presence => true, :uniqueness => true
	validates :description, :presence => true, :uniqueness => true
end
