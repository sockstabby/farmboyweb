defmodule PhoenixReactWeb.TaskJSON do
  alias PhoenixReact.TaskAdmin.Task

  @doc """
  Renders a list of tasks.
  """
  def index(%{tasks: tasks}) do
    %{data: for(task <- tasks, do: data(task))}
  end

  @doc """
  Renders a single task.
  """
  def show(%{task: task}) do
    %{data: data(task)}
  end

  defp data(%Task{} = task) do
    %{
      id: task.id,
      taskid: task.taskid,
      name: task.name,
      schedule: task.schedule,
      enabled: task.enabled,
      config: task.config,
      slack: task.slack
    }
  end
end
