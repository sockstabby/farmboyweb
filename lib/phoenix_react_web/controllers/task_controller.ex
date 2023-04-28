defmodule PhoenixReactWeb.TaskController do
  use PhoenixReactWeb, :controller

  alias PhoenixReact.TaskAdmin
  alias PhoenixReact.TaskAdmin.Task

  action_fallback PhoenixReactWeb.FallbackController

  def index(conn, _params) do
    tasks = TaskAdmin.list_tasks()
    render(conn, :index, tasks: tasks)
  end

  def create(conn, %{"task" => task_params}) do
    with {:ok, %Task{} = task} <- TaskAdmin.create_task(task_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/tasks/#{task}")
      |> render(:show, task: task)
    end
  end

  def show(conn, %{"id" => id}) do
    task = TaskAdmin.get_task!(id)
    render(conn, :show, task: task)
  end

  def update(conn, %{"id" => id, "task" => task_params}) do
    task = TaskAdmin.get_task!(id)

    with {:ok, %Task{} = task} <- TaskAdmin.update_task(task, task_params) do
      render(conn, :show, task: task)
    end
  end

  def delete(conn, %{"id" => id}) do
    task = TaskAdmin.get_task!(id)

    with {:ok, %Task{}} <- TaskAdmin.delete_task(task) do
      send_resp(conn, :no_content, "")
    end
  end
end
