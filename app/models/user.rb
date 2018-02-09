require "digest/sha1"

class User < ApplicationRecord

	has_many :subjects # ??
	has_many :forum_messages
	has_many :following_subjects, dependent: :destroy
	has_many :followed_subjects, through: :following_subjects, source: :subject

	before_save :encrypt_password
	after_save :clear_password

	attr_accessor :password
	attr_accessor :password_confirmation

	EMAIL_REGEX = /\A[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\z/i
	UVA_USERNAME_REGEX = /\A[\p{L}\p{N}_]{3,}\z/i
	CODEFORCES_USERNAME_REGEX = /\A[\p{L}\p{N}_]{3,24}\z/i
	SLACK_USERNAME_REGEX = /\A[a-z0-9._-]{1,21}\z/i

	validates :username, :presence => true, :uniqueness => true, :length => { :in => 3..40 }
	validates :uva, :uniqueness => true, :format => UVA_USERNAME_REGEX, :allow_blank => true
	validates :codeforces, :uniqueness => true, :format => CODEFORCES_USERNAME_REGEX, :allow_blank => true
	validates :slack, :uniqueness => true, :format => SLACK_USERNAME_REGEX, :allow_blank => true
	validates :email, :presence => true, :uniqueness => true, :format => EMAIL_REGEX
	validates :display_name, :length => { :in => 3..40 }, :uniqueness => true
	validates :initials, :length => { :in => 2..6 }, :uniqueness => true, :allow_blank => true
	validates :password, :length => { :minimum => 6}, :confirmation => true, :on => :create
	validates :password_confirmation, presence: true, :on => :create

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
