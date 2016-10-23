class CreateSubjects < ActiveRecord::Migration[5.0]
  def change
    create_table :subjects do |t|
      t.string :title
      t.integer :category
      t.boolean :pinned

      t.timestamps
    end
  end
end
