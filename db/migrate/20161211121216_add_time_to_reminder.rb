class AddTimeToReminder < ActiveRecord::Migration[5.0]
  def change
    add_column :reminders, :time, :datetime
  end
end
