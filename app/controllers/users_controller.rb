class UsersController < ApplicationController
	before_action :save_login_state, :only => [:login, :login_attempt, :signup, :profile]
	
	EMAIL_REGEX = /\A[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\z/i
	UVA_USERNAME_REGEX = /\A[A-Z0-9_]{3,}\z/i
	
	def signup
		@user = User.new
	end
	
	def create
		@user = User.new(user_params)
		if validate_length(@user.username, "username", 3, 40) && validate_uniqueness(User, "username", @user.username, "username")
			if validate_regex(@user.uva, UVA_USERNAME_REGEX, "UVa username") && validate_uniqueness(User, "uva", @user.uva, "UVa username")
				if validate_regex(@user.email, EMAIL_REGEX, "email address") && validate_uniqueness(User, "email", @user.email, "email")
					if validate_length(@user.password, "password", 4) && validate_identity(@user.password_confirmation, @user.password, "password confirmation", "password")
						session[:success] = "Your account has been created."
						redirect_to "/"
						return
					end
				end
			end
		end
		render "signup"
	end
	
	def logout
		session[:user_id] = nil
		session[:info] = "You successfully signed out."
		redirect_to "/"
	end
	
	def login_attempt
		authorized_user = User.authenticate(params[:username_or_email], params[:login_password])
		if authorized_user
			session[:user_id] = authorized_user.id
			session[:success] = "You are now logged in. Welcome, <strong>#{authorized_user.username}</strong> !"
			redirect_to "/"
		else
			show_error("Invalid username or password.")
			render "index/index"
		end
	end
	
	def profile
	end
	
	private
		def user_params
			params.require(:user).permit(:username, :uva, :email, :admin, :inscription_date, :password, :password_confirmation)
		end
end
