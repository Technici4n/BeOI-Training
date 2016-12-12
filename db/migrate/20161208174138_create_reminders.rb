class CreateReminders < ActiveRecord::Migration[5.0]
  def change
    create_table :reminders do |t|
      t.boolean :reminded
      t.text :description
      t.string :title
      t.text :message

      t.timestamps
    end
  end
end
