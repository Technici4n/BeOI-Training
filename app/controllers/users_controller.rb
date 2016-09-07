class UsersController < ApplicationController
	before_action :save_login_state, :only => [:login, :login_attempt, :signup, :profile]
	
	def signup
		@user = User.new
	end
	
	def create
		@user = User.new(user_params)
		if(@user.password == nil || @user.password_confirmation == nil || @user.password.length < 4 || @user.password != @user.password_confirmation)
			@user.errors.add(:base, "Password must be at least 4 characters long and match the password confirmation")
			render "signup"
		elsif @user.save
			redirect_to "/"
		else
			render "signup"
		end
	end
	
	def logout
		session[:user_id] = nil
		redirect_to "/"
	end
	
	def login_attempt
		authorized_user = User.authenticate(params[:username_or_email], params[:login_password])
		if authorized_user
			session[:user_id] = authorized_user.id
			flash[:notice] = "Welcome, #{authorized_user.username}"
			redirect_to "/"
		else
			@login_error = "Invalid username or password"
			flash[:notice] = "Invalid username or password"
			render "login"
		end
	end
	
	def profile
	end
	
	private
		def user_params
			params.require(:user).permit(:username, :uva, :email, :admin, :inscription_date, :password, :password_confirmation)
		end
end
