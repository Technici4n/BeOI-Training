class ApplicationController < ActionController::Base
	protect_from_forgery with: :exception
	helper_method :show_error, :get_error_format, :get_success_format, :get_info_format

	# Make sure the reminder emails get sent
	before_action :send_mails
	before_action :remove_past_reminders

	# Send emails 1 day before an event
	def send_mails
		Reminder.where(time: Time.now..(Time.now + 1.day), reminded: false).each do |r|
			User.all.each do |u|
				Pony.mail(:to => u.email, :subject => r.title, :html_body => "<p>Hi #{u.display_name.html_safe},</p><p>Just a quick reminder... Don't forget about this event, planned the #{ApplicationHelper.datetime_to_s(r.time)}:</p><h4>#{r.title}</h4><p>#{r.description}</p>Yours truly,<br>The BeOI Training team.")
			end
			r.update(reminded: true)
		end
	end

	def remove_past_reminders
		Reminder.where("time < ?", Time.now).destroy_all
	end

	# Add the error ("msg") to the errors to be alerted
	def show_error(msg)
		session[:errors] ||= []
		session[:errors] << msg
	end

	# Returns the error HTML code, and clears the error list
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
		return out.html_safe
	end

	# Returns the success HTML code
	def get_success_format
		msg = session[:success]
		out = ""
		if msg && msg != ""
			out += "<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>"
			out += msg
			out += "</div>"
		end
		session[:success] = nil
		return out.html_safe
	end

	# Returns the info HTML code
	def get_info_format
		msg = session[:info]
		out = ""
		if msg && msg != ""
			out += "<div class=\"alert alert-info alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>"
			out += msg
			out += "</div>"
		end
		session[:info] = nil
		return out.html_safe
	end

	# Check if str is at least lgth charachters long
	def validate_length(str, field_name, lgth, max_lgth = 1.0/0.0)
		if str && str.length >= lgth && str.length <= max_lgth
			return true
		else
			if max_lgth < 1.0/0.0
				show_error("The #{field_name} must be between #{lgth} and #{max_lgth} characters long.")
			else
				show_error("The #{field_name} must be at least #{lgth} characters long.")
			end
			return false
		end
	end

	# Check identity
	def validate_identity(str1, str2, field_name1, field_name2)
		if str1 == str2
			return true
		else
			show_error("The #{field_name1} must match the #{field_name2}.")
			return false
		end
	end

	# Check RegEx
	def validate_regex(str, regex, field_name, format_info = nil)
		match = regex.match(str)
		if match && match.to_s.length == str.length
			return true
		else
			if format_info
				show_error("The #{field_name} is invalid. #{format_info}")
			else
				show_error("The #{field_name} is invalid.")
			end
		end
	end

	# Check uniqueness for "val" inside the "database_entry" field of the "model_class" model
	def validate_uniqueness(model_class, database_entry, val, field_name)
		if !val || model_class.find_by(database_entry.to_sym => val)
			show_error("This #{field_name} has already been taken.")
			return false
		else
			return true
		end
	end

	# Check if length > 0
	def validate_existing(str, field_name)
		if str && str.length > 0
			return true
		else
			show_error("The #{field_name} can't be blank.")
			return false
		end
	end

	protected
		# Keeps the user logged in over multiple pages
		def authenticate_user(kick = true)
			if User.exists?(id: session[:user_id])
				@current_user = User.find(session[:user_id])
				return true
			elsif kick
				show_error("You must be logged in to do that.")
				redirect_to "/"
				return false
			end
		end
		# Redirects the user to the root if he is connected
		def save_login_state
			if User.exists?(id: session[:user_id])
				redirect_to "/"
				return false
			else
				return true
			end
		end
		# Kick user if he is not an admin
		def admin_check
			if @current_user.admin != true
				show_error("You are not allowed to do that.")
				redirect_to "/"
			end
		end
end
