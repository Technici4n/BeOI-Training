require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module BeoiTraining
	class Application < Rails::Application
		# Settings in config/environments/* take precedence over those specified here.
		# Application configuration should go into files in config/initializers
		# -- all .rb files in that directory are automatically loaded.
		
		# Load ENV variables from "local_env.yml"
		config.before_configuration do
		  env_file = File.join(Rails.root, 'config', 'local_env.yml')
		  YAML.load(File.open(env_file)).each do |key, value|
			ENV[key.to_s] = value
		  end if File.exists?(env_file)
		end if Rails.env.development?
		
		config.time_zone = 'Brussels'
		
		# Filter from logs
		config.filter_parameters += [:password, :password_confirmation]
	end
end
