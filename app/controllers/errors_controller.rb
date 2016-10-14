class ErrorsController < ApplicationController
	# Default route redirect
	def show404
		show_error("You have entered an unvalid URL")
		redirect_to "/"
	end
end
