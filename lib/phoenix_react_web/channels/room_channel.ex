defmodule PhoenixReactWeb.RoomChannel do
  use PhoenixReactWeb, :channel
  require Logger
  alias Phoenix.PubSub


  @impl true
  def join("room:" <> room_id, _params, socket) do
    PubSub.subscribe(:tasks, "user:123")
    {:ok, %{channel: "room:#{room_id}"}, assign(socket, :room_id, room_id)}
  end


  @impl true
  @spec handle_info(
          {:task_update,
           %{
             :id => any,
             :msg => any,
             :node => any,
             :origin_node => any,
             :roomid => any,
             optional(any) => any
           }},
          any
        ) :: {:noreply, any}

  def handle_info( {:task_update, payload }, state) do
    %{id: _id, msg: msg, roomid: roomid, node: node, origin_node: origin_node} = payload
    PhoenixReactWeb.Endpoint.broadcast!("room:#{roomid}", "new_msg", %{"message" => msg, "node" => node} )
    {:noreply, state}
  end

end
