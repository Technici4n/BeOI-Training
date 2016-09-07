module ApplicationHelper
	def self.datetime_to_s(datetime)
		return "#{datetime.to_date.to_s}, at #{datetime.to_time.hour.to_s.rjust(2, "0")}:#{datetime.to_time.min.to_s.rjust(2, "0")}:#{datetime.to_time.sec.to_s.rjust(2, "0")}"
	end
	def self.milisecs_to_s(milisecs)
		return "#{(milisecs / 1000).to_s}.#{(milisecs % 1000).to_s.rjust(3, "0")}"
	end
end
