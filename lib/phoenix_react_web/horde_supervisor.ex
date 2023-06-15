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
    # in dev mode we'll use UDP gossip to discover items in the cluster
    children_dev = [
      {Cluster.Supervisor, [topologies_gossip(), [name: Cluster.Supervisor]]},
      HordeTaskRouter.HordeRegistry,
      HordeTaskRouter.NodeObserver,
      {Phoenix.PubSub, name: :tasks}
    ]

    # in production mode we'll use a headless DNS service in kubernetes
    # to discover items in the cluster.
    children_prod = [
      Supervisor.child_spec(
        {Cluster.Supervisor,
         [topologies_worker(), [name: BackgroundJob.ClusterSupervisorPhoenix]]},
        id: :phoenix_cluster_sup
      ),
      Supervisor.child_spec(
        {Cluster.Supervisor,
         [topologies_router(), [name: BackgroundJob.ClusterSupervisorRouter]]},
        id: :router_cluster_sup
      ),
      HordeTaskRouter.HordeRegistry,
      HordeTaskRouter.NodeObserver,
      {Phoenix.PubSub, name: :tasks}
    ]

    env = String.to_atom(System.get_env("MIX_ENV") || "dev")
    Logger.info("env = #{env}")

    children = if env == :dev, do: children_dev, else: children_prod

    Supervisor.init(children, strategy: :one_for_one)
  end

  defp topologies_gossip do
    [
      background_job: [
        strategy: Cluster.Strategy.Gossip
      ]
    ]
  end

  defp topologies_worker do
    [
      k8s_example: [
        strategy: Elixir.Cluster.Strategy.Kubernetes.DNS,
        config: [
          service: "cluster-svc",
          application_name: "worker",
          polling_interval: 3_000
        ]
      ]
    ]
  end

  defp topologies_router do
    [
      k8s_example: [
        strategy: Elixir.Cluster.Strategy.Kubernetes.DNS,
        config: [
          service: "cluster-svc",
          application_name: "task_router",
          polling_interval: 3_000
        ]
      ]
    ]
  end
end
