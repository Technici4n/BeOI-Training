# Join table between users and the subjects they are following
class FollowingSubject < ApplicationRecord
	belongs_to :user
	belongs_to :subject
end
