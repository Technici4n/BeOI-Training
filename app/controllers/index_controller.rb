require "net/http"
require "uri"

class IndexController < ApplicationController
	def index
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
