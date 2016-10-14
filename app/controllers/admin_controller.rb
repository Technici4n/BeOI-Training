require "application_helper"

class AdminController < ApplicationController
	before_action :authenticate_user, :admin_check
	
	# Main page
	def index
		@subforum = Subforum.new
		if(Event.last) # Have to use a model just to store 3 fields...
			@event = Event.last
		else
			@event = Event.new
		end
	end
	
	# New subforum action
	def new_subforum
		@subforum = Subforum.new(subforum_params)
		if validate_existing(@subforum.title, "title") && validate_uniqueness(Subforum, "title", @subforum.title, "title") && validate_existing(@subforum.description, "description") && @subforum.save
			redirect_to "/forum"
		else
			render "index"
		end
	end
	
	# Event update action
	def update_event
		if(Event.last)
			puts event_params[:disabled]
			Event.last.update(event_params)
		else
			Event.new(event_params).save
		end
		redirect_to "/admin"
	end
	
	# Clear event action
	def clear_event
		User.all.each do |u|
			u.update(:in_event => false)
		end
		redirect_to "/admin"
	end
	
	private
		def subforum_params
			params.require(:subforum).permit(:title, :description)
		end
		
		def event_params
			params.require(:event).permit(:name, :participation_text, :disabled)
		end
end
