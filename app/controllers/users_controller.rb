class UsersController < ApplicationController
	before_action :save_login_state, :only => [:login, :login_attempt, :signup]
	before_action :authenticate_user, :only => [:profile, :update]

	EMAIL_REGEX = /\A[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\z/i
	UVA_USERNAME_REGEX = /\A[A-Z0-9_]{3,}\z/i

	# Profile page
	def profile
		@user = User.find(session[:user_id])
	end

	# Update (profile page) action
	def update
		@user = User.find(session[:user_id])

		if @user.update(update_user_params)
			session[:success] = "You account has successfully been updated."
			redirect_to "/users/profile"
		else
			@user.errors.full_messages.each do |m|
				show_error(m)
			end
			render "profile"
		end
	end

	# Sign up page
	def signup
		@user = User.new
	end

	# Sign up action
	def create
		require "net/http"

		@user = User.new(new_user_params)
		@user.is_contestant = false
		@user.in_event = false
		@user.last_forum_visit = Time.now
		@user.unread_subjects = 0
		@user.username.downcase!
		@user.email.downcase!
		@user.should_notify_new_subjects = false
		if @user.save
			session[:success] = "Your account has been created. You are now logged in. Welcome, <strong>#{@user.display_name}</strong> !"
			session[:user_id] = @user.id
			redirect_to "/"
		else
			@user.errors.full_messages.each do |m|
				show_error(m)
			end
			render "signup"
		end
	end

	# User logout action
	def logout
		session[:user_id] = nil
		session[:info] = "You successfully signed out."
		redirect_to "/"
	end

	# Login attempt
	def login_attempt
		authorized_user = User.authenticate(params[:username_or_email].downcase, params[:login_password])
		if authorized_user
			session[:user_id] = authorized_user.id
			session[:success] = "You are now logged in. Welcome, <strong>#{authorized_user.display_name}</strong> !"
			redirect_to "/"
		else
			show_error("Invalid username or password.")
			render "index/index"
		end
	end

	private
		def new_user_params
			params.require(:user).permit(:username, :uva, :codeforces, :display_name, :initials, :email, :admin, :inscription_date, :password, :password_confirmation)
		end

		def update_user_params
			params.require(:user).permit(:uva, :codeforces, :display_name, :initials, :is_contestant, :in_event)
		end
end
