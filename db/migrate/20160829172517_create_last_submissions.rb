class CreateLastSubmissions < ActiveRecord::Migration[5.0]
  def change
    create_table :last_submissions do |t|
	  t.integer :submission_id
      t.string :username
      t.integer :problem
      t.integer :verdict
      t.integer :lang
      t.integer :time
      t.integer :submit_time

      t.timestamps
    end
  end
end
