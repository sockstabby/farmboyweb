defmodule PhoenixReact.Repo.Migrations.CreateTasks do
  use Ecto.Migration

  def change do
    create table(:tasks) do
      add :taskid, :integer
      add :name, :string
      add :schedule, :string
      add :enabled, :boolean, default: false, null: false
      add :config, :string
      add :slack, :boolean, default: false, null: false

      timestamps()
    end
  end
end
