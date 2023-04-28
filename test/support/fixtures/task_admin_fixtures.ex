defmodule PhoenixReact.TaskAdminFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `PhoenixReact.TaskAdmin` context.
  """

  @doc """
  Generate a task.
  """
  def task_fixture(attrs \\ %{}) do
    {:ok, task} =
      attrs
      |> Enum.into(%{
        config: "some config",
        enabled: true,
        name: "some name",
        schedule: "some schedule",
        slack: true,
        taskid: 42
      })
      |> PhoenixReact.TaskAdmin.create_task()

    task
  end
end
