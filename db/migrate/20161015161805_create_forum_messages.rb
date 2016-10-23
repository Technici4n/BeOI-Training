class CreateForumMessages < ActiveRecord::Migration[5.0]
  def change
    create_table :forum_messages do |t|
      t.string :text
      t.integer :author_id

      t.timestamps
    end
  end
end
