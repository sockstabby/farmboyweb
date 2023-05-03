defmodule TaskStatusListener.Listener do
  use GenServer
  require Logger

  alias Phoenix.PubSub


  def start_link(_opts) do
    Logger.info("Task Listener starting")
    GenServer.start_link(__MODULE__, :ok, name: :TaskStatusListener)
  end

  ## Defining GenServer Callbacks

  @impl true
  def init(_args) do
    PubSub.subscribe(:tasks, "user:123")
    {:ok, %{}}
  end

  @impl true
  def handle_info( {:task_update, payload }, state) do
    Logger.info("Handled task_update message in handle_info: #{inspect(payload)}")
    %{id: _id, msg: msg, roomid: roomid, node: node, origin_node: origin_node} = payload

    #if origin_node == node() do
    PhoenixReactWeb.Endpoint.broadcast!("room:#{roomid}", "new_msg", %{"message" => msg, "node" => node} )
    #end

    {:noreply, state}
  end

  @impl true
  def handle_info(msg, state) do
    IO.puts("Unexpected message in handle_info: #{inspect(msg)}")
    {:noreply, state}
  end

end
