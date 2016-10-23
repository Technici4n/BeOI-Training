Rails.application.routes.draw do
	
	# User management
	get "/users/signup", to: "users#signup"
	post "/users/create", to: "users#create"
	post "/users/login_attempt", to: "users#login_attempt"
	get "/users/logout", to: "users#logout"
	get "/users/profile", to: "users#profile"
	patch "/users/profile", to: "users#update"
	
	# Forum
	get "/subjects", to: "subjects#index"
	get "/subjects/new", to: "subjects#new"
	post "/subjects/new", to: "subjects#create"
	get "/subjects/:subject_id", to: "subjects#show"
	post "/subjects/:subject_id", to: "subjects#create_message"
	get "/subjects/edit/:message_id", to: "subjects#edit"
	patch "/subjects/edit/:message_id", to: "subjects#update"
	patch "/subjects/:subject_id/toggle_pinned", to: "subjects#toggle_pinned"
	
	# Admin tools
	get "/admin", to: "admin#index"
	patch "/admin/update_event", to: "admin#update_event"
	delete "/admin/clear_event", to: "admin#clear_event"

	# Misc.
	get "/tracker", to: "index#tracker"
	get "/test", to: "index#test" if Rails.env.development?
	
	root "index#index"
	
	# Default route
	match "*path", to: "errors#show404", via: :all unless Rails.env.development?
end
