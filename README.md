# Introduction

Farmboy is a distributed and scalable task runner. This is originally intended to be used to collect thousands of datapoints
from an external API.

The project is split up into three repos.

Farmboy - is an Elixir OTP Genserver that is reponsible for discovering workers in a cluster. It uses the Quantum Elixir module to schedule tasks. It distibutes the work by choosing a node with the least load average. It invokes a Farmboy Task passing it
the configuration whenever it is scheduled to run.

Farmboy Task - is the task that you define. This repo provides a sample implementation. Tasks can publish status messages which in turn get written to a Phoenix channel so end users can see the logs in realtime.

Farmboy Web - A user interface, webserver and API to configure tasks and get task status.

Take a look at the in app screenshots in the Web app repo's [appscreens](https://github.com/sockstabby/farmboyweb/tree/master/appscreens) folder.

# Getting started

The very first time you run you will need to create db connection and configure config/dev.exs so that the connection parameters are valid. Once valid you will need to run mix ecto.migrate in the root of this project to create the table that will be used to store task configuration.

Note: This depends on the router repo to be started as it calls into it to get a list of running tasks. See the router readme for more info.

This typically runs in a cluster with a task router and this directly depends on it as it calls a genserver to get a list of running tasks. If the farmboy, aka task router, is not running you will see an error in the console.

In debug mode items in the cluster are discovered using a UDP gossip protocol. In production mode the cluster items are discovered using a headless service in Kubernetes.

# Frontend code

This repo contains a react project that can be build using a custom mix task mix webapp. In a future version this frontend javascript will be broken out into its own repo and we will integrate the build script to pull from it instead of storing the frontend javascript code in here in the Phoenix repo. All React javascript code is contained here in the frontend folder.

If you want to iterate on the frontend you can start the phoenix server ( see below )
and then run this command in the frontend folder

```
npm run dev
```

vite will then proxy all requests and redirect to the Phoenix webserver.

# Running the app from Phoenix

Go to http://localhost:4000/app/

# Building

You have several options to build this code

1. Run a debug build

   ```
   #first run the worker from the farmboytask separate repo run

   iex --name worker@127.0.0.1 --cookie asdf -S  mix

   #from the farmboy separate repo run
   iex --name router@127.0.0.1 --cookie asdf -S mix


   # finally run the phoenix web app
   iex --name phoenix@127.0.0.1 --cookie asdf -S mix phx.server

   ```

   Note that the default mode will be debug as long as MIX_ENV is not set to prod.

2. You can run a production release to run in docker or kubernetes.

   ```
   docker build . -t phoeniximage
   docker tag phoeniximage {docker-hub-username}/{default-repo-folder-name}:phoeniximage
   docker push {docker-hub-username}/{default-repo-folder-name}:phoeniximage

   ```

   Now it will be availabe to create containers in your Kubernetes
   cluster. See the Phoenix_dep.yaml file in Kubs repo for an example of how it gets referenced.

3. Run the production build locally. There remains some clean up work to do by it can
   be done running the following commands.

   ```
   mix phx.gen.secret

   #It will output a very long string. Something like this:

   #B41pUFgfTJeEUpt+6TwSkbrxlAb9uibgIemaYbm1Oq+XdZ3Q96LcaW9sarbGfMhy

   #Now export this secret as a environment variable:

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

   ```

<p>We now have our production release ready. Let’s fire it up with the following command:</p>

     RELEASE_COOKIE=asdf PHX_HOST=localhost _build/prod/rel/phoenix_react/bin/phoenix_react start

Note: You might need to experiment with setting MIX_ENV here if you dont want to use UDB gossip
for discover of items in the cluster.
