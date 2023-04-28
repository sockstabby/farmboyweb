# Build Instructions

Make sure endpoint is configured correctly in config/runtime.exs

    config :phoenix_react, PhoenixReactWeb.Endpoint,
      url: [host: host, port: port],
      server: true,
      http: [
        ip: {0, 0, 0, 0, 0, 0, 0, 0},
        port: port
      ],
      secret_key_base: secret_key_base

    # Generate a secret for our Phoenix app
    mix phx.gen.secret
    # It will output a very long string. Something like this:
    B41pUFgfTJeEUpt+6TwSkbrxlAb9uibgIemaYbm1Oq+XdZ3Q96LcaW9sarbGfMhy

    # Now export this secret as a environment variable:
    export SECRET_KEY_BASE=B41pUFgfTJeEUpt+6TwSkbrxlAb9uibgIemaYbm1Oq+XdZ3Q96LcaW9sarbGfMhy

    # Export the database URL
    # Probably very different in production for you.
    # I'm just using the local postgreSQL dev instance for this demo
    export DATABASE_URL=ecto://postgres:postgres@localhost/phoenix_react_dev

    # Get production dependencies
    mix deps.get --only prod

    # Compile the project for production
    MIX_ENV=prod mix compile

    # Generate static assets in case you
    # are using Phoenix default assets pipelines
    # For serve-side rendered pages
    MIX_ENV=prod mix assets.deploy

    # Generate our React frontend using
    # our custom mix task
    mix webapp

    # Genereate the convenience scripts to assist
    # Phoenix applicaiton deployments like running ecto migrations
    mix phx.gen.release

    # Now we are ready to generate the Elixir Release
    MIX_ENV=prod mix release

<p>We now have our production release ready. Let’s fire it up with the following command:</p>

    PHX_HOST=localhost _build/prod/rel/phoenix_react/bin/phoenix_react start

    # You should an output similar to the following
    19:52:53.813 [info] Running PhoenixReactWeb.Endpoint with cowboy 2.9.0 at :::4000 (http)
    19:52:53.814 [info] Access PhoenixReactWeb.Endpoint at http://localhost:4000
    # Original Generated Readme Below

