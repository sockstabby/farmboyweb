defmodule PhoenixReact.TaskAdminTest do
  use PhoenixReact.DataCase

  alias PhoenixReact.TaskAdmin

  describe "tasks" do
    alias PhoenixReact.TaskAdmin.Task

    import PhoenixReact.TaskAdminFixtures

    @invalid_attrs %{config: nil, enabled: nil, name: nil, schedule: nil, slack: nil, taskid: nil}

    test "list_tasks/0 returns all tasks" do
      task = task_fixture()
      assert TaskAdmin.list_tasks() == [task]
    end

    test "get_task!/1 returns the task with given id" do
      task = task_fixture()
      assert TaskAdmin.get_task!(task.id) == task
    end

    test "create_task/1 with valid data creates a task" do
      valid_attrs = %{config: "some config", enabled: true, name: "some name", schedule: "some schedule", slack: true, taskid: 42}

      assert {:ok, %Task{} = task} = TaskAdmin.create_task(valid_attrs)
      assert task.config == "some config"
      assert task.enabled == true
      assert task.name == "some name"
      assert task.schedule == "some schedule"
      assert task.slack == true
      assert task.taskid == 42
    end

    test "create_task/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = TaskAdmin.create_task(@invalid_attrs)
    end

    test "update_task/2 with valid data updates the task" do
      task = task_fixture()
      update_attrs = %{config: "some updated config", enabled: false, name: "some updated name", schedule: "some updated schedule", slack: false, taskid: 43}

      assert {:ok, %Task{} = task} = TaskAdmin.update_task(task, update_attrs)
      assert task.config == "some updated config"
      assert task.enabled == false
      assert task.name == "some updated name"
      assert task.schedule == "some updated schedule"
      assert task.slack == false
      assert task.taskid == 43
    end

    test "update_task/2 with invalid data returns error changeset" do
      task = task_fixture()
      assert {:error, %Ecto.Changeset{}} = TaskAdmin.update_task(task, @invalid_attrs)
      assert task == TaskAdmin.get_task!(task.id)
    end

    test "delete_task/1 deletes the task" do
      task = task_fixture()
      assert {:ok, %Task{}} = TaskAdmin.delete_task(task)
      assert_raise Ecto.NoResultsError, fn -> TaskAdmin.get_task!(task.id) end
    end

    test "change_task/1 returns a task changeset" do
      task = task_fixture()
      assert %Ecto.Changeset{} = TaskAdmin.change_task(task)
    end
  end
end
