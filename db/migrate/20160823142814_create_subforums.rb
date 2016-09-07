class CreateSubforums < ActiveRecord::Migration[5.0]
  def change
    create_table :subforums do |t|
      t.string :title
      t.string :description

      t.timestamps
    end
  end
end
