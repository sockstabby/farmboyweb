defmodule PhoenixReactWeb.RoomChannel do
  use PhoenixReactWeb, :channel
  require Logger

  def join("room:" <> room_id, _params, socket) do
    Logger.info("WOOOOOOOOOWWW")

    send(self(), :after_join)
    {:ok, %{channel: "room:#{room_id}"}, assign(socket, :room_id, room_id)}
  end


  @impl true
  def handle_info({:work, socket}, state) do
    #Logger.info( "HERE WE GO HERE WE GO HERE WE GO HERE WE GO HERE WE GO HERE WE GO ")
    broadcast(socket, "new_msg", %{yeah: "baby"})
    Process.send_after(self(), {:work, socket}, 1_000)
    #Logger.info("WE DID IT ")

    {:noreply, state}
  end

  @impl true
  def handle_info(:after_join, socket) do
    Process.send_after(self(), {:work, socket}, 1_000)
    {:noreply, socket}
  end

  @impl true
  def handle_info( {:task_update, payload }, state) do
    IO.puts("Handled task_update message in handle_info: #{inspect(payload)}")
    %{id: _id, msg: msg, roomid: roomid, node: node, origin_node: origin_node} = payload
    PhoenixReactWeb.Endpoint.broadcast!("room:#{roomid}", "new_msg", %{"message" => msg, "node" => node} )
    {:noreply, state}
  end

end
