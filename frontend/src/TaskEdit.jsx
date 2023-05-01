import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";

import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";

const TASK_MAP = {
  1: "MISO FTR Collector",
  2: "ERCOT FTR Collector",
  3: "SPPISO FTR Collector",
  4: "NEISO FTR Collector",
  7: "NYISO FTR Collector",
};

function MultiInput() {
  return (
    <div className={"parent"}>
      <div className="div1"></div>
      <div className="div2">label</div>
      <div className="div3">control</div>
      <div className="div4">checkbox</div>
    </div>
  );
}

const allEqual = (arr) => arr.every((val) => val === arr[0]);

const getConsensus = (items, key, noConsensusValue = "") => {
  const vals = items.map((i) => i[key]);

  const ret = allEqual(vals) ? vals[0] : noConsensusValue;
  return ret;
};

export function TaskEdit({ mode }) {
  const { state } = useLocation();

  const [tasks, setTasks] = useState(state);

  const [name, setName] = useState(
    mode === "edit" ? getConsensus(state, "name") : ""
  );
  const [enabled, setEnabled] = useState(
    mode === "edit" ? getConsensus(state, "enabled", false) : true
  );

  const [config, setConfig] = useState(
    mode === "edit" ? getConsensus(state, "config", "") : "{}"
  );
  const [schedule, setSchedule] = useState(
    mode === "edit" ? getConsensus(state, "schedule") : "* * * * *"
  );
  const [slackEnabled, setSlackEnabled] = useState(
    mode === "edit" ? getConsensus(state, "slack", false) : true
  );
  const [taskid, setTaskid] = useState(
    mode === "edit" ? getConsensus(state, "taskid", 0) : 1
  );

  console.log("taskid", taskid);

  const navigate = useNavigate();

  async function addTask(task) {
    const response = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: {
          name,
          taskid,
          schedule,
          enabled,
          config,
          slack: slackEnabled,
        },
      }),
    });
    console.log("response", response);
  }

  async function editTasks(tasks) {
    const responses = [];

    tasks.forEach(async (task) => {
      console.log("editing task", task.id, task);

      const obj = {
        task: {
          name: task.name,
          taskid: task.taskid,
          schedule: schedule,
          enabled: enabled,
          config: config,
          slack: slackEnabled,
        },
      };

      console.log("saving", obj);
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: {
            name: task.name,
            taskid: task.taskid,
            schedule: schedule,
            enabled: enabled,
            config: config,
            slack: slackEnabled,
          },
        }),
      });

      console.log("response=", response);
      responses.push(response);
    });
  }

  const onSave = () => {
    if (mode === "add") {
      console.log("calling save task");
      addTask();
    }

    if (mode === "edit") {
      console.log("calling edit task");
      editTasks(tasks);
    }

    navigate(-1);
  };

  const onCancel = () => {
    navigate(-1);
  };

  const setNameVal = (event) => {
    setName(event.target.value);
  };

  const setEnabledVal = (event) => {
    setEnabled(event.target.checked);
  };

  const setSlackEnabledVal = (event) => {
    setSlackEnabled(event.target.checked);
  };

  const setConfigurationVal = (event) => {
    setConfig(event.target.value);
  };

  const setScheduleVal = (event) => {
    setSchedule(event.target.value);
  };

  const setTaskidVal = (event) => {
    console.log("setTaskidVal ", event.target.value);

    setTaskid(event.target.value);
  };

  let editTitle = "Editing Existing Task";

  if (mode === "edit") {
    editTitle =
      tasks.length > 1 ? "Editing Existing Tasks" : "Editing Existing Task";
  }

  return (
    <div>
      <MultiInput />
      <div className="edit-page">
        <div className="edit-inputs">
          {mode === "edit" ? <h5>{editTitle}</h5> : <h5>Add New Task</h5>}
          <div className="vertical-input">
            Task Name:
            <input
              type="text"
              disabled={mode === "edit" && tasks.length > 1}
              value={name}
              onChange={setNameVal}
            ></input>
          </div>
          <div className="checkbox-vertical-input">
            <Form.Check
              type="checkbox"
              id="Enabled"
              label="Enabled"
              checked={enabled}
              onChange={setEnabledVal}
            />
          </div>
          <div className="vertical-input">
            Task Id:
            <Form.Select
              aria-label="Default select example"
              onChange={setTaskidVal}
            >
              <option>{TASK_MAP[taskid]}</option>
              <option value={1}>{TASK_MAP[1]}</option>
              <option value={2}>{TASK_MAP[2]}</option>
              <option value={3}>{TASK_MAP[3]}</option>
              <option value={4}>{TASK_MAP[4]}</option>
              <option value={7}>{TASK_MAP[7]}</option>
            </Form.Select>
          </div>
          <div className="vertical-input">
            Task Configuration:
            <input
              type="text"
              value={config}
              onChange={setConfigurationVal}
            ></input>
          </div>
          <div className="vertical-input">
            Schedule:
            <input
              type="text"
              value={schedule}
              onChange={setScheduleVal}
            ></input>
          </div>
          <div className="checkbox-vertical-input">
            <Form.Check
              type="checkbox"
              id="Send Slack"
              label="Send Slack Message"
              checked={slackEnabled}
              onChange={setSlackEnabledVal}
            />
          </div>

          <div className="form-button-container">
            <Button variant="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="light" onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
