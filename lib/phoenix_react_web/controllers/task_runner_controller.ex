defmodule PhoenixReactWeb.TaskRunnerController do
  use PhoenixReactWeb, :controller
  require Logger

  def runtask(conn, _params) do
    body = conn.body_params

    object = body["object"]
    method = body["method"]
    args = body["args"]
    roomid = body["roomid"]

    GenServer.cast(
      {:via, Horde.Registry, {Farmboy.HordeRegistry, "taskrouter"}},
      {:run_task,
       %{object: object, method: method, args: args, roomid: roomid, origin_node: node()}}
    )

    conn |> json(%{message: "Ran the task refresh task state to see new"})
  end

  def get_task_state(conn, _params) do
    pid = GenServer.whereis(via_tuple("taskrouter"))
    state = :sys.get_state(pid)

    tasks =
      Enum.map(state.tasks, fn i ->
        %{
          id: i.instance,
          worker: i.worker,
          method: i.taskid,
          args: i.args,
          time_started: i.time_started
        }
      end)

    new_state = Map.put(state, :taskinfo, tasks)
    new_state = Map.delete(new_state, :tasks)
    conn |> json(new_state)
  end

  def via_tuple(name), do: {:via, Horde.Registry, {Farmboy.HordeRegistry, name}}
end
