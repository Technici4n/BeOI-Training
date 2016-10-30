class CreateProblemsets < ActiveRecord::Migration[5.0]
  def change
    create_table :problemsets do |t|
      t.string :title
      t.integer :type

      t.timestamps
    end
  end
end
