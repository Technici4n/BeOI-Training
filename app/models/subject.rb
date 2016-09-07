class Subject < ApplicationRecord
	has_many :forum_messages, dependent: :destroy
	belongs_to :subforum
	
	validates :title, :presence => true, :uniqueness => true, :length => {:in => 4..50}
end
