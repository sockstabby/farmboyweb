defmodule TaskStatusListener.Supervisor do
  use Supervisor
  require Logger

  def start_link(opts) do
    Supervisor.start_link(__MODULE__, :ok, opts)
  end

  @impl true
  @spec init(:ok) ::
          {:ok,
           {%{
              intensity: non_neg_integer,
              period: pos_integer,
              strategy: :one_for_all | :one_for_one | :rest_for_one
            }, [{any, any, any, any, any, any} | map]}}

  def init(:ok) do
    env = String.to_atom(System.get_env("MIX_ENV") || "dev")

    children = [
      {Cluster.Supervisor, [topologies(), [name: Cluster.Supervisor]]},
      HordeTaskRouter.HordeRegistry,
      HordeTaskRouter.NodeObserver,
      {Phoenix.PubSub, name: :tasks},
      TaskStatusListener.Listener
    ]

    #children =
    #    if env == :dev, do: children_dev, else: children_prod

    opts = [strategy: :one_for_one, name: HelloWorld.Supervisor]

    Logger.debug("What the heck is going on?")

    Supervisor.init(children, strategy: :one_for_one)
  end


  defp topologies do
    [
      background_job: [
        strategy: Cluster.Strategy.Gossip
      ]
    ]
  end

end
