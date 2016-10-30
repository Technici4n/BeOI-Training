module ProblemsetsHelper
	def self.difficulty_to_s(diff)
		case diff
		when 0
			return "Trivial"
		when 1
			return "Very easy"
		when 2
			return "Easy"
		when 3
			return "Medium easy"
		when 4
			return "Medium"
		when 5
			return "Medium advanced"
		when 6
			return "Advanced"
		when 7
			return "Advanced hard"
		when 8
			return "Hard"
		when 9
			return "Very hard"
		else
			return "Bug! Please report."
		end
	end
end
