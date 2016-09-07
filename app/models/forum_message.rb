class ForumMessage < ApplicationRecord
	belongs_to :subject
	
	validates :text, :presence => true, :length => {:in => 1..8192}
end
