class ProblemsetsController < ApplicationController
	before_action do
		authenticate_user(false)
	end
	before_action :admin_check, :only => [:edit, :create, :update, :edit_specific, :create_problem, :remove_problem]

	def index
		@users = User.where(is_contestant: true)
	end

	def edit
		@problemsets = Problemset.all
		@problemset = Problemset.new
	end

	def create
		@problemset = Problemset.new(problemset_params)

		if @problemset.save
			redirect_to "/problemsets/edit"
		else
			@problemset.errors.full_messages.each do |m|
				show_error(m)
			end
			render "edit"
		end
	end

	def update
		@problemset = Problemset.find(params[:problemset_id])
		@problemset.update(problemset_params)
		redirect_to "/problemsets/#{params[:problemset_id]}/edit"
	end

	def delete
		@problemset = Problemset.find(params[:problemset_id])
		@problemset.destroy
		redirect_to "/problemsets/edit"
	end

	def edit_specific
		@problemset = Problemset.find(params[:problemset_id])
	end

	def create_problem
		@problemset = Problemset.find(params[:problemset_id])
		@problem = @problemset.problems.create(new_problem_params)

		if @problem.errors.any?
			@problem.errors.full_messages.each do |m|
				show_error(m)
			end
			render "edit_specific"
		else
			redirect_to "/problemsets/#{params[:problemset_id]}/edit"
		end
	end

	def remove_problem
		@problem = Problem.find(params[:problem_id])
		@problem.problemset.problems.destroy(@problem)
		redirect_to "/problemsets/#{@problem.problemset.id}/edit"
	end

	private
		def problemset_params
			return params.require(:problemset).permit(:title, :visible)
		end

		def new_problem_params
			return params.require(:problem).permit(:website, :handle, :difficulty)
		end
end
