require "application_helper"

class AdminController < ApplicationController
	before_filter :authenticate_user, :admin_check
	
	def index
		@subforum = Subforum.new()
	end
	
	def new_subforum
		@subforum = Subforum.new(subforum_params)
		if validate_existing(@subforum.title, "title") && validate_uniqueness(Subforum, "title", @subforum.title, "title") && validate_existing(@subforum.description, "description") && @subforum.save
			redirect_to "/forum"
		else
			render "index"
		end
	end
	
	private
		def subforum_params
			params.require(:subforum).permit(:title, :description)
		end
end
