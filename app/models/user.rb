require "digest/sha1"

class User < ApplicationRecord

	has_many :subjects
	has_many :forum_messages

	before_save :encrypt_password
	after_save :clear_password

	attr_accessor :password
	attr_accessor :password_confirmation
	
	EMAIL_REGEX = /\A[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\z/i
	UVA_USERNAME_REGEX = /\A[A-Z0-9_]{3,}\z/i
	
	validates :username, :presence => true, :uniqueness => true, :length => { :in => 3..40 }
	validates :uva, :presence => true, :uniqueness => true, :format => UVA_USERNAME_REGEX
	validates :email, :presence => true, :uniqueness => true, :format => EMAIL_REGEX
	
	def encrypt_password
		if password.present?
			self.salt = Digest::SHA1.hexdigest("Let us add #{email} as unchanging value and #{Time.now} as changing value :)")
			self.hashed_password = Digest::SHA1.hexdigest("To encrypt, just add the #{salt} to the #{password}")
		end
		
		if self.admin == nil
			self.admin = false
		end
	end
	def clear_password
		self.password = nil
	end
	def self.authenticate(username_or_email = "", entered_password = "")
		if EMAIL_REGEX.match(username_or_email)
			user = User.find_by_email(username_or_email)
		else
			user = User.find_by_username(username_or_email)
		end
		if user && user.match_password(entered_password)
			return user
		else
			return false
		end
	end
	def match_password(entered_password)
		return self.hashed_password == Digest::SHA1.hexdigest("To encrypt, just add the #{salt} to the #{entered_password}")
	end
end
