defmodule PhoenixReact.TaskAdmin do
  @moduledoc """
  The TaskAdmin context.
  """

  import Ecto.Query, warn: false
  alias PhoenixReact.Repo

  alias PhoenixReact.TaskAdmin.Task

  require Logger

  @doc """
  Returns the list of tasks.

  ## Examples

      iex> list_tasks()
      [%Task{}, ...]

  """
  def list_tasks do
    Repo.all(Task)
  end

  @doc """
  Gets a single task.

  Raises `Ecto.NoResultsError` if the Task does not exist.

  ## Examples

      iex> get_task!(123)
      %Task{}

      iex> get_task!(456)
      ** (Ecto.NoResultsError)

  """
  def get_task!(id), do: Repo.get!(Task, id)

  @doc """
  Creates a task.

  ## Examples

      iex> create_task(%{field: value})
      {:ok, %Task{}}

      iex> create_task(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_task(attrs \\ %{}) do
    ret =
      %Task{}
      |> Task.changeset(attrs)
      |> Repo.insert()

    GenServer.cast(
      {:via, Horde.Registry, {Farmboy.HordeRegistry, "taskrouter"}},
      {:task_item_added, ret}
    )

    ret
  end

  def notify_schedule_change(_changed_task, nil) do
    Logger.warn("the task to update does not exist")
  end

  def notify_schedule_change(changed_task, saved_task) do
    changed_schedule = Map.get(changed_task, "schedule")
    saved_schedule = Map.get(saved_task, :schedule)
    Logger.debug("saved schedule #{saved_schedule}")
    Logger.debug("changed schedule #{changed_schedule}")

    if changed_schedule != saved_schedule do
      Logger.debug("schedule changed. notifying the taskrouter")

      GenServer.cast(
        {:via, Horde.Registry, {Farmboy.HordeRegistry, "taskrouter"}},
        {:task_schedule_changed, saved_task}
      )
    else
      Logger.debug("schedule did not change. dont bother the taskrouter")
    end
  end

  @doc """
  Updates a task.

  ## Examples

      iex> update_task(task, %{field: new_value})
      {:ok, %Task{}}

      iex> update_task(task, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_task(%Task{} = task, attrs) do
    # here we see if the schdule of the task had change
    # if so we need to notify the router
    task_stored = Task |> Repo.get(task.id)
    notify_schedule_change(attrs, task_stored)

    task
    |> Task.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a task.

  ## Examples

      iex> delete_task(task)
      {:ok, %Task{}}

      iex> delete_task(task)
      {:error, %Ecto.Changeset{}}

  """
  def delete_task(%Task{} = task) do
    GenServer.cast(
      {:via, Horde.Registry, {Farmboy.HordeRegistry, "taskrouter"}},
      {:task_item_removed, task}
    )

    Repo.delete(task)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking task changes.

  ## Examples

      iex> change_task(task)
      %Ecto.Changeset{data: %Task{}}

  """
  def change_task(%Task{} = task, attrs \\ %{}) do
    Task.changeset(task, attrs)
  end
end
