defmodule PhoenixReactWeb.RoomChannel do
  use PhoenixReactWeb, :channel
  require Logger

  @impl true
  #def join("room:lobby", payload, socket) do
    #if authorized?(payload) do
    #{:ok, socket}
    #else
    #  {:error, %{reason: "unauthorized"}}
    #end
  #end

  def join("room:" <> room_id, _params, socket) do
    Logger.debug( "WOOOOOOOOOWWW")
    {:ok, %{channel: "room:#{room_id}"}, assign(socket, :room_id, room_id)}
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  @impl true
  @spec handle_in(<<_::32, _::_*8>>, any, any) ::
          {:noreply, Phoenix.Socket.t()} | {:reply, {:ok, any}, any}
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  @impl true
  def handle_in("shout", payload, socket) do
    broadcast(socket, "shout", payload)
    {:noreply, socket}
  end


end
