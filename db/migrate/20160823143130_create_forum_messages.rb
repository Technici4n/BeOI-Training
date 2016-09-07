class CreateForumMessages < ActiveRecord::Migration[5.0]
  def change
    create_table :forum_messages do |t|
      t.string :text
      t.date :message_date

      t.timestamps
    end
  end
end
