class ApplicationController < ActionController::Base
	protect_from_forgery with: :exception
	helper_method :show_error, :get_error_format

	def show_error(msg)
		session[:errors] ||= []
		session[:errors] << msg
		puts session[:errors] = session[:errors]
	end
	
	def get_error_format
		errors = session[:errors]
		out = ""
		if errors && errors.count > 0
			out += "<div class=\"alert alert-danger alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button><strong>Oh, snap ! Something went wrong !</strong>"
			out += "<ul>"
			errors.each do |err|
				out += "<li>#{err}</li>"
			end
			out += "</ul>"
			out += "</div>"
		end
		session[:errors] = []
		return out.html_safe()
	end
	
	protected
		def authenticate_user(kick = true)
			if User.exists?(id: session[:user_id])
				@current_user = User.find(session[:user_id])
				return true
			elsif kick
				redirect_to "/users/login"
				return false
			end
		end
		def save_login_state
			if session[:user_id]
				redirect_to "/"
				return false
			else
				return true
			end
		end
		def admin_check
			if @current_user.admin != true
				redirect_to "/"
			end
		end
end
