class RemindersController < ApplicationController
	before_action :authenticate_user
	before_action :admin_check

	def index
		@reminders = Reminder.all
		@reminder = Reminder.new
	end

	def create
		@reminder = Reminder.new(new_reminder_params)
		@reminder.reminded = false

		if @reminder.save
			redirect_to "/reminders"
		else
			@reminder.errors.full_messages.each do |m|
				show_error(m)
			end
			@reminders = Reminder.all
			render "index"
		end
	end

	def edit
		@reminder = Reminder.find(params[:reminder_id])
	end

	def update
		@reminder = Reminder.find(params[:reminder_id])

		if @reminder.update(update_reminder_params)
			session[:success] = "Reminder successfully updated !"
			redirect_to "/reminders"
		else
			@reminder.errors.full_messages.each do |m|
				show_error(r)
			end
			render "/reminders/#{@reminder.id}/edit"
		end
	end

	def delete
		@reminder = Reminder.find(params[:reminder_id])
		@reminder.destroy
		redirect_to "/reminders"
	end

	private
		def new_reminder_params
			return params.require(:reminder).permit(:title, :description, :time)
		end

		def update_reminder_params
			return params.require(:reminder).permit(:title, :description, :time, :reminded)
		end
end
