class AddSlackToUser < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :slack, :string, limit: 21
  end
end
