class SubjectsController < ApplicationController
	before_action :authenticate_user, :only => [:new, :create, :edit, :update, :create_message, :toggle_pinned, :start_following, :stop_following, :delete]
	before_action only: [:index, :show] do
		authenticate_user(false)
	end
	before_action :same_user_check, :only => [:edit, :update]
	before_action :admin_check, :only => [:toggle_pinned, :delete]
	after_action :update_last_forum_visit
	after_action :clear_unread_subjects_count, :only => [:index]

	def index
		# Pagination
		params[:page] ||= 1
		@subjects = Subject.includes(forum_messages: :user).order(pinned: :desc, last_message_time: :desc).paginate(:page => params[:page])
	end

	def show
		@subject = Subject.find(params[:subject_id])
		@subject.update(views: @subject.views + 1)
		@message = ForumMessage.new

		# Pagination
		params[:page] ||= 1
		params[:page] = @subject.forum_messages.count.zero? ? 1 : (@subject.forum_messages.count / ForumMessage.per_page.to_f).ceil if params[:page] == 'last'
		@messages = @subject.forum_messages.includes(:user).order(:created_at).paginate(:page => params[:page])
	end

	def new
		@subject = Subject.new
		@message = ForumMessage.new
	end

	def create
		@subject = Subject.new(new_subject_params)
		@message = ForumMessage.new(:text => params[:text])

		@message.user = User.find(session[:user_id])
		@message.subject = @subject

		@subject.pinned = false
		@subject.views = 0

		@subject.valid?
		@message.valid?

		if @subject.errors.any? || @message.errors.any?
			(@subject.errors.full_messages + @message.errors.full_messages).each do |m|
				show_error(m)
			end
			render "new"
		else
			@subject.save
			@message.subject = @subject
			@message.save
			@subject.last_message_time = @message.created_at
			@subject.forum_messages << @message
			@subject.update(forum_messages: @subject.forum_messages, last_message_time: @message.created_at)

			update_unread_subjects
			broadcast_subject_creation(@subject)

			redirect_to "/subjects/#{@subject.id}"
		end
	end

	def edit
		@message = ForumMessage.find(params[:message_id])
		@subject = @message.subject
	end

	def update
		@message = ForumMessage.find(params[:message_id])
		@subject = @message.subject

		if @message.update(message_params)
			redirect_to "/subjects/#{@subject.id}?page=last"
		else
			@message.errors.full_messages.each do |m|
				show_error(m)
			end
			render "edit"
		end
	end

	def toggle_pinned
		@subject = Subject.find(params[:subject_id])
		@subject.update(pinned: !@subject.pinned)
		redirect_to "/subjects/#{params[:subject_id]}"
	end

	def create_message
		@subject = Subject.find(params[:subject_id])
		@message = ForumMessage.new(message_params)

		@message.user_id = session[:user_id]
		@message.subject = @subject

		if @message.valid?
			@message.save
			@subject.update(forum_messages: (@subject.forum_messages << @message), last_message_time: @message.created_at)

			update_unread_subjects
			# Send mail to followers
			@subject.following_users.each do |u|
				if u != @current_user and u.slack
					send_notification(@subject, @message, "@#{u.slack}")
				end
			end
			redirect_to "/subjects/#{@subject.id}?page=last"
		else
			@message.errors.full_messages.each do |m|
				show_error(m)
			end
			render "show", subject_id: params[:subject_id]
		end
	end

	def start_following
		@subject = Subject.find(params[:subject_id])
		if !@subject.following_users.exists?(@current_user.id)
			@subject.following_users << @current_user
		else
			show_error("You are already following this subject.")
		end
		redirect_to "/subjects/#{@subject.id}"
	end

	def stop_following
		@subject = Subject.find(params[:subject_id])
		if @subject.following_users.exists?(@current_user.id)
			@subject.following_users.delete(@current_user)
		end
		redirect_to "/subjects/#{@subject.id}"
	end

	def delete
		@subject = Subject.find(params[:subject_id])
		@subject.destroy
		session[:success] = "Subject successfully removed."
		redirect_to "/subjects"
	end

	private
		def same_user_check
			@message = ForumMessage.find(params[:message_id])
			if !(@current_user.id == @message.user.id || @current_user.admin)
				show_error("You are not allowed to do that.")
				redirect_to "/"
			end
		end

		def update_last_forum_visit
			if @current_user
				@current_user.update(last_forum_visit: Time.now)
			end
		end

		def new_subject_params
			params.require(:subject).permit(:title)
		end

		def message_params
			params.require(:forum_message).permit(:text)
		end

		def update_unread_subjects # Need better algorithm for this => O(nlog n) ?
			User.all.each do |u|
				u.update(unread_subjects: Subject.all.select{|s| s.last_message_time >= u.last_forum_visit}.count) if @current_user.id != u.id
			end
		end

		def clear_unread_subjects_count
			if @current_user
				@current_user.unread_subjects = 0
			end
		end

		def escape_string(s)
			#Great fun with backslashes: https://www.ruby-forum.com/topic/143645
			s.gsub('&', '&amp;').gsub('<', '&lt;').gsub('>', '&gt;').gsub('\\', '\\\\\\\\').gsub('"', '\\"')
		end

		def send_notification(subject, message, channel)
			uri = URI(ENV['SLACK_WEBHOOK_URL'])
			http = Net::HTTP.new(uri.hostname, uri.port)
			http.use_ssl = true
			post = Net::HTTP::Post.new(uri.path)

			attachment_text = message.text.gsub(/\s+/, " ")
			if attachment_text.length > 50 then
				attachment_text = attachment_text[0..49] + "…"
			end

			title = subject.title
			color = "good"
			if subject.forum_messages.length > 1 then
				color = "#428BCA"
				title = "_Reply to:_ #{title}"
			end


			post.body = <<-BODY.gsub(/\s+/, " ")
				{"attachments": [
					{
						"title": "#{escape_string(title)}",
						"title_link": "#{ENV['APP_URL']}/subjects/#{subject.id}",
						"text": "#{escape_string(attachment_text)}",
						"author_name": "#{escape_string(message.user.display_name)}",
						"color": "#{color}"
						#{if channel != nil then
							", \"channel\": \"#{escape_string(channel)}\""
						end}
					}
				]}
			BODY
			post['Content-Type'] = 'application/json'
			http.request(post)
		end

		def broadcast_subject_creation(subject)
			send_notification(subject, subject.forum_messages.first, nil)
		end
end
