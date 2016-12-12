require "net/http"
require "uri"

class IndexController < ApplicationController
	def index
		if params[:users]
			user_list = User.where(id: params[:users])
		else
			user_list = User.all
		end
		@users = user_list.map{ |u| [u.id, ["", u.uva, u.display_name, u.id == session[:user_id], u.is_contestant]] }.to_h
	end

	def tracker
	end

	def test
	end
	#Evil HTTPS hack
	def codeforces_request
		url = URI.parse("http://codeforces.com/api/#{params["method"]}")
		req = Net::HTTP::Get.new(url.to_s)
		res = Net::HTTP.start(url.hostname, url.port) { |http| http.request(req) }
		render :json => res.body
	end
end
