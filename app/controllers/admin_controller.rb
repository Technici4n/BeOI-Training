require "application_helper"

class AdminController < ApplicationController
	before_filter :authenticate_user, :admin_check
	
	def index
		@subforum = Subforum.new()
	end
	
	def new_subforum
		@subforum = Subforum.new(subforum_params)
		if !(@subforum.title && @subforum.title.length > 0)
			show_error("Title can't be blank !")
		elsif !(@subforum.description && @subforum.description.length > 0)
			show_error("Description can't be blank !")
		end
		if @subforum.save
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
