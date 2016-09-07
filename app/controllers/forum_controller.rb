class ForumController < ApplicationController
	before_action :authenticate_user, :only => [:new_subject, :create_subject, :new_message, :create_message]

	def index
		
	end
	
	def show
		@subforum = Subforum.find(params[:id])
		@subforum.subjects.sort_by &:created_at#{|s| m = s.forum_messages[s.forum_messages.count - 1]
									#t = m.message_time
									#d = m.message_date
									#d.year.to_s + d.mon.to_s + d.day.to_s + t.hour.to_s + t.min.to_s + t.sec.to_s}
		puts @subforum.subjects
		@subject = Subject.new
	end
	
	def create_subject
		# Create first message
		@first_message = ForumMessage.new
		@first_message.text = params[:message_text]
		@first_message.author_id = User.find(session[:user_id]).id
		
		# Create subject
		if not params[:message_text]
			@subject.errors.add(:message_text, message: "can't be blank")
			render "new_subject", :subject => @subject
			return
		end
		@first_message.save
		
		@subject = Subject.new
		@subforum = Subforum.find(params[:id])
		@subject.subforum = @subforum
		@subject.title = params[:title]
		@subject.forum_messages.push(@first_message)
		
		if @subject.save
			@first_message.update(:subject => @subject)
			redirect_to "/forum/#{params[:id]}"
		else
			render "new_subject", :subject => @subject
		end
	end
	
	def new_subject
		@subforum = Subforum.find(params[:id])
		@subject = Subject.new
	end
	
	def show_subject
		@subject = Subject.find(params[:subject_id])
		@subforum = @subject.subforum
	end
	
	def new_message
		@forum_message = ForumMessage.new
		@subject = Subject.find(params[:subject_id])
		@subforum = @subject.subforum
	end
	
	def create_message
		@forum_message = ForumMessage.new(forum_message_params)
		@forum_message.subject = Subject.find(params[:subject_id])
		@forum_message.author_id = User.find(session[:user_id]).id
		if @forum_message.save
			redirect_to "/forum/subjects/#{@forum_message.subject.id}"
		else
			render "new_message", :forum_message => @forum_message, :subject => @subject
		end
	end
	
	private
		def forum_message_params
			params.require(:forum_message).permit(:text)
		end
end
