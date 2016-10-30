class CreateProblems < ActiveRecord::Migration[5.0]
  def change
    create_table :problems do |t|
      t.integer :type
      t.string :handle
      t.integer :problemset_id

      t.timestamps
    end
  end
end
