class UsersController < ApplicationController
	before_action :save_login_state, :only => [:login, :login_attempt, :signup]
	before_action :authenticate_user, :only => [:profile, :update]
	
	EMAIL_REGEX = /\A[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\z/i
	UVA_USERNAME_REGEX = /\A[A-Z0-9_]{3,}\z/i
	
	def profile
		@user = User.find(session[:user_id])
	end
	
	def update
		@user = User.find(session[:user_id])
		
		if validate_regex(@user.uva, UVA_USERNAME_REGEX, "UVa username") && (params[:user][:uva] == @user.uva || validate_uniqueness(User, "uva", params[:user][:uva], "UVa username"))
			if validate_length(@user.display_name, "displayed name", 3, 40) && (params[:user][:display_name] == @user.display_name || validate_uniqueness(User, "display_name", params[:user][:display_name], "displayed name"))
				if @user.update(update_user_params)
					session[:success] = "You account has successfully been updated."
					redirect_to "/users/profile"
					return
				end
			end
		end
		
		render "profile"
	end
	
	def signup
		@user = User.new
	end
	
	def create
		require "net/http"
		
		@user = User.new(new_user_params)
		if validate_length(@user.username, "username", 3, 40) && validate_uniqueness(User, "username", @user.username, "username")
			if validate_regex(@user.uva, UVA_USERNAME_REGEX, "UVa username") && validate_uniqueness(User, "uva", @user.uva, "UVa username")
				if validate_length(@user.display_name, "displayed name", 3, 40) && validate_uniqueness(User, "display_name", @user.display_name, "displayed name")
					if validate_regex(@user.email, EMAIL_REGEX, "email address") && validate_uniqueness(User, "email", @user.email, "email")
						if validate_length(@user.password, "password", 4) && validate_identity(@user.password_confirmation, @user.password, "password confirmation", "password")
							@user.is_contestant = false
							@user.in_event = false
							if @user.save
								session[:success] = "Your account has been created. You are now logged in. Welcome, <strong>#{@user.display_name}</strong> !"
								session[:user_id] = @user.id
								redirect_to "/"
								return
							end
						end
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
			session[:success] = "You are now logged in. Welcome, <strong>#{authorized_user.display_name}</strong> !"
			redirect_to "/"
		else
			show_error("Invalid username or password.")
			render "index/index"
		end
	end
	
	private
		def new_user_params
			params.require(:user).permit(:username, :uva, :display_name, :email, :admin, :inscription_date, :password, :password_confirmation)
		end
		
		def update_user_params
			params.require(:user).permit(:uva, :display_name, :is_contestant, :in_event)
		end
end
