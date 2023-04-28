# PhoenixReact

Make sure endpoint is configured correctly in config/runtime.exs

config :phoenix_react, PhoenixReactWeb.Endpoint,
  # here use the `port` variable so we can control that with environment variables
  url: [host: host, port: port],
  # Enable the web server
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


# Original Generated Readme Below

To start your Phoenix server:

  * Run `mix setup` to install and setup dependencies
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix
