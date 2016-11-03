if Rails.env != 'test'
	Pony.options = 
	{
		:from => ENV['GMAIL_USER_NAME'],
		:via => :smtp,
		:via_options =>
		{
			address: 'smtp.gmail.com',
			port: '587',
			domain: 'gmail.com',
			user_name: ENV['GMAIL_USER_NAME'],
			password: ENV['GMAIL_PASSWORD'],
			authentication: :plain,
			enable_starttls_auto: true
		}
	}
end