Rails.application.routes.draw do
	
	# User management
	get "/users/signup", to: "users#signup"
	post "/users/create", to: "users#create"
	post "/users/login_attempt", to: "users#login_attempt"
	get "/users/logout", to: "users#logout"
	get "/users/profile", to: "users#profile"
	patch "/users/profile", to: "users#update"
	
	# Admin tools
	get "/admin", to: "admin#index"
	post "/admin/new_subforum", to: "admin#new_subforum"
	
	# Forum
	get "/forum", to: "forum#index"
	get "/forum/:id", to: "forum#show"
	post "/forum/:id/create_subject", to: "forum#create_subject"
	get "/forum/:id/new", to: "forum#new_subject"
	get "/forum/subjects/:subject_id", to: "forum#show_subject"
	get "/forum/subjects/:subject_id/new", to: "forum#new_message"
	post "/forum/subjects/:subject_id/create", to: "forum#create_message"

	root "index#index"
	
	# Default route
	match "*path", to: "errors#show404", via: :all unless Rails.env.development?
end
