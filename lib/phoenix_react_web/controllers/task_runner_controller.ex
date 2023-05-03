defmodule PhoenixReactWeb.TaskRunnerController do
  use PhoenixReactWeb, :controller
  require Logger


  def api_get(conn, params) do
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

end
