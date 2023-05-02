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
    mode === "edit" ? getConsensus(state, "config", "{}") : "{}"
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

  const [multiEditCheckState, setMultiEditCheckState] = useState({});

  console.log("taskid", taskid);

  const navigate = useNavigate();

  let isValid = true;

  if (mode === "add") {
    isValid = config !== "" && schedule !== "" && name !== "";
  }

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

    const multiEdit = tasks.length > 1;

    tasks.forEach(async (task) => {
      console.log("editing task", task.id, task);

      const obj = {
        task: {
          name: tasks.length > 1 ? task.name : name,
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
            // in multi the value will either be the input control or the current value
            // follow this pattter
            // this first one is the exception we can have multiple tasks with the same name
            name: multiEdit ? task.name : name,

            taskid:
              multiEdit === false
                ? taskid
                : isMultiEditChecked("taskid")
                ? taskid
                : task.taskid,

            schedule:
              multiEdit === false
                ? schedule
                : isMultiEditChecked("schedule")
                ? schedule
                : task.schedule,

            enabled:
              multiEdit === false
                ? enabled
                : isMultiEditChecked("enabled")
                ? enabled
                : task.enabled,

            config:
              multiEdit === false
                ? config
                : isMultiEditChecked("config")
                ? config
                : task.config,

            slack:
              multiEdit === false
                ? slackEnabled
                : isMultiEditChecked("slackEnabled")
                ? slackEnabled
                : task.slack,
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
    editTitle = tasks.length > 1 ? "Edit Multiple Tasks" : "Edit Task";
  }

  function wrapSingleEdit(className, label, control) {
    return (
      <div className={className}>
        {label}
        {control}
      </div>
    );
  }

  const setMultiEditCheckStateVal = (inputName, val) => {
    const mergedObj = { ...multiEditCheckState, ...{ [inputName]: val } };
    setMultiEditCheckState(mergedObj);
  };

  const isMultiEditChecked = (inputName) => {
    const ret =
      multiEditCheckState.hasOwnProperty(inputName) &&
      multiEditCheckState[inputName] === true
        ? true
        : false;

    return ret;
  };

  function wrapMultiEdit(className, inputName, label, control) {
    return (
      <div className={className}>
        <div className={"parent"}>
          <div className="div1"></div>
          <div className="div2">{label}</div>
          <div className="div3">{control}</div>
          <div className="div4">
            {" "}
            <Form.Check
              type="checkbox"
              id="Enabled"
              label=""
              checked={isMultiEditChecked(inputName)}
              onChange={(event) => {
                setMultiEditCheckStateVal(inputName, event.target.checked);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  const nameInput = (
    <input
      type="text"
      disabled={mode === "edit" && tasks.length > 1}
      value={name}
      onChange={setNameVal}
    ></input>
  );

  const enabledInput = (
    <Form.Check
      type="checkbox"
      id="Enabled"
      label="Enabled"
      checked={enabled}
      onChange={setEnabledVal}
    />
  );

  const taskIdInput = (
    <Form.Select aria-label="Default select example" onChange={setTaskidVal}>
      <option>{TASK_MAP[taskid]}</option>
      <option value={1}>{TASK_MAP[1]}</option>
      <option value={2}>{TASK_MAP[2]}</option>
      <option value={3}>{TASK_MAP[3]}</option>
      <option value={4}>{TASK_MAP[4]}</option>
      <option value={7}>{TASK_MAP[7]}</option>
    </Form.Select>
  );

  const taskConfigInput = (
    <input type="text" value={config} onChange={setConfigurationVal}></input>
  );

  const scheduleInput = (
    <input type="text" value={schedule} onChange={setScheduleVal}></input>
  );

  const slackInput = (
    <Form.Check
      type="checkbox"
      id="Send Slack"
      label="Send Slack Message"
      checked={slackEnabled}
      onChange={setSlackEnabledVal}
    />
  );

  return (
    <div>
      <div className="edit-page">
        <div className="edit-inputs">
          {mode === "edit" ? <h5>{editTitle}</h5> : <h5>Add New Task</h5>}
          {mode === "edit" && tasks.length > 1 && (
            <p>Only items explicitly checked will be applied to all tasks. </p>
          )}

          {mode === "edit" && tasks.length > 1
            ? wrapMultiEdit("vertical-input", "name", "Task Name", nameInput)
            : wrapSingleEdit("vertical-input", "Task Name", nameInput)}

          {mode === "edit" && tasks.length > 1
            ? wrapMultiEdit(
                "checkbox-vertical-input",
                "enabled",
                "",
                enabledInput
              )
            : wrapSingleEdit(
                "checkbox-vertical-input",
                "Enabled",
                enabledInput
              )}

          {mode === "edit" && tasks.length > 1
            ? wrapMultiEdit("vertical-input", "taskid", "Task", taskIdInput)
            : wrapSingleEdit("vertical-input", "Task", taskIdInput)}

          {mode === "edit" && tasks.length > 1
            ? wrapMultiEdit(
                "vertical-input",
                "config",
                "Task Configuration",
                taskConfigInput
              )
            : wrapSingleEdit(
                "vertical-input",
                "Task Configuration",
                taskConfigInput
              )}

          {mode === "edit" && tasks.length > 1
            ? wrapMultiEdit(
                "vertical-input",
                "schedule",
                "Schedule",
                scheduleInput
              )
            : wrapSingleEdit("vertical-input", "Schedule", scheduleInput)}

          {mode === "edit" && tasks.length > 1
            ? wrapMultiEdit(
                "checkbox-vertical-input",
                "slackEnabled",
                "",
                slackInput
              )
            : wrapSingleEdit(
                "checkbox-vertical-input",
                "Send Slack Message:",
                slackInput
              )}

          <div className="form-button-container">
            <Button variant="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="light" disabled={!isValid} onClick={onSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
