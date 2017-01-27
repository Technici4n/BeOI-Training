if Rails.env != 'test'
	Pony.options =
	{
		:from => ENV['MAIL_USER_NAME'],
		:via => :smtp,
		:via_options =>
		{
			address: 'smtp.mail.com',
			port: '587',
			domain: 'mail.com',
			user_name: ENV['MAIL_USER_NAME'],
			password: ENV['MAIL_PASSWORD'],
			authentication: :plain,
			enable_starttls_auto: true
		}
	}
end
