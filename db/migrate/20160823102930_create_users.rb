class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users do |t|
      t.string :username
      t.string :uva
      t.date :inscription_date
      t.string :email
      t.string :hashed_password
      t.string :salt
      t.boolean :admin

      t.timestamps
    end
  end
end
