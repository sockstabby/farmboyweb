defmodule PhoenixReactWeb.TaskRunnerController do
  use PhoenixReactWeb, :controller
  require Logger


  def api_get(conn, _params) do
    Logger.info( "run called")

    body = conn.body_params

    object = body["object"]
    method = body["method"]
    args = body["args"]
    roomid = body["roomid"]

    #notice we pass the node name. this is to prevent duplicate broadcasts when we run
    #multiple phoenix web servers in a cluster. Before we broadcast we can check to see if
    #the api orinated from the same node. otherwise dont broadcast because it is redundant and
    #unnecessary
    GenServer.cast({:via, Horde.Registry, {HordeTaskRouter.HordeRegistry, "taskrouter"}},
       {:run_task, %{object: object, method: method, args: args, roomid: roomid, origin_node: node()}})

    conn |> json(%{message: "Hello" })
  end


  def get_task_state(conn, _params) do
    pid = GenServer.whereis(via_tuple("taskrouter"))
    state = :sys.get_state(pid)

    tasks = Enum.map(state.tasks, fn i -> %{id: i.object, worker: i.worker, method: i.method, args: i.args, time_started: i.time_started } end )
    new_state = Map.put(state, :taskinfo, tasks)
    new_state = Map.delete(new_state, :tasks)
    conn |> json(new_state)

  end

  def via_tuple(name), do: {:via, Horde.Registry, {HordeTaskRouter.HordeRegistry, name}}


end
