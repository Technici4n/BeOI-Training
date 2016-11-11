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
	put "/subjects/:subject_id/start_following", to: "subjects#start_following_subject"
	delete "/subjects/:subject_id/stop_following", to: "subjects#stop_following_subject"
	
	# Problemsets
	get "/problemsets", to: "problemsets#index"
	get "/problemsets/edit", to: "problemsets#edit"
	post "/problemsets/edit", to: "problemsets#create"
	get "/problemsets/:problemset_id/edit", to: "problemsets#edit_specific"
	post "/problemsets/:problemset_id/edit", to: "problemsets#create_problem"
	delete "/problemsets/remove/:problem_id", to: "problemsets#remove_problem"
	patch "/problemsets/:problemset_id/update", to: "problemsets#update"
	
	# Admin tools
	get "/admin", to: "admin#index"
	patch "/admin/update_event", to: "admin#update_event"
	delete "/admin/clear_event", to: "admin#clear_event"

	# Misc.
	get "/test", to: "index#test" if Rails.env.development?
	get "/codeforces", to: "index#codeforces_request"
	
	root "index#index"
	
	# Default route
	match "*path", to: "errors#show404", via: :all unless Rails.env.development?
end
