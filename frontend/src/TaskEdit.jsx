import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";

import Button from "@mui/material/Button";

const allEqual = (arr) => arr.every((val) => val === arr[0]);

const getConsensus = (items, key, noConsensusValue = "") => {
  const vals = items.map((i) => i[key]);

  const ret = allEqual(vals) ? vals[0] : noConsensusValue;
  return ret;
};

export function TaskEdit({ mode, taskMetaData, onClose, items }) {
  const [tasks, setTasks] = useState(items);

  const [name, setName] = useState(
    mode === "edit" ? getConsensus(items, "name") : ""
  );
  const [enabled, setEnabled] = useState(
    mode === "edit" ? getConsensus(items, "enabled", false) : true
  );
  const [config, setConfig] = useState(
    mode === "edit" ? getConsensus(items, "config", "{}") : "{}"
  );
  const [schedule, setSchedule] = useState(
    mode === "edit" ? getConsensus(items, "schedule") : "* * * * *"
  );
  const [slackEnabled, setSlackEnabled] = useState(
    mode === "edit" ? getConsensus(items, "slack", false) : true
  );
  const [taskid, setTaskid] = useState(
    mode === "edit" ? getConsensus(items, "taskid", 1) : 1
  );

  const [multiEditCheckState, setMultiEditCheckState] = useState({});

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
  }

  async function editTasks(tasks) {
    const responses = [];

    const multiEdit = tasks.length > 1;

    tasks.forEach(async (task) => {
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

      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: {
            // in multi the value will either be the input control or the current value
            // follow this patttern
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

      responses.push(response);
    });
  }

  const onSave = () => {
    if (mode === "add") {
      addTask();
    }

    if (mode === "edit") {
      editTasks(tasks);
    }

    onClose(true);
  };

  const onCancel = () => {
    onClose(false);
  };

  const setNameVal = (event) => {
    setName(event.target.value);
  };

  const setEnabledVal = (event) => {
    setEnabled(event.target.value);
  };

  const setSlackEnabledVal = (event) => {
    setSlackEnabled(event.target.value);
  };

  const setConfigurationVal = (event) => {
    setConfig(event.target.value);
  };

  const setScheduleVal = (event) => {
    setSchedule(event.target.value);
  };

  const setTaskidVal = (event) => {
    setTaskid(event.target.value);
  };

  function wrapSingleEdit(className, label, control) {
    return <div className={className}>{control}</div>;
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
          <div className="div3">{control}</div>
          <div className="div4">
            {" "}
            <Checkbox
              defaultChecked
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
    <TextField
      onChange={setNameVal}
      id="standard-basic"
      label="Name"
      variant="outlined"
      value={name}
    />
  );

  const enabledInput = (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Enabled</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={enabled}
        label="Enabled"
        onChange={setEnabledVal}
      >
        <MenuItem value={true}>True</MenuItem>;
        <MenuItem value={false}>False</MenuItem>;
      </Select>
    </FormControl>
  );

  const currentTask = taskMetaData.find((task) => task.taskid === taskid);

  const taskOptions = taskMetaData.map((task) => {
    return (
      <MenuItem key={task.taskid} value={task.taskid}>
        {task.task_display_name}
      </MenuItem>
    );
  });

  const taskIdInput = (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Task</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={taskid}
        label="Task"
        onChange={setTaskidVal}
      >
        {taskOptions}
      </Select>
    </FormControl>
  );

  const taskConfigInput2 = (
    <input type="text" value={config} onChange={setConfigurationVal}></input>
  );

  const taskConfigInput = (
    <TextField
      onChange={setConfigurationVal}
      id="standard-basic"
      label="Configuration"
      variant="outlined"
      value={config}
    />
  );

  const scheduleInput2 = (
    <input type="text" value={schedule} onChange={setScheduleVal}></input>
  );

  const scheduleInput = (
    <TextField
      onChange={setScheduleVal}
      id="standard-basic"
      label="Schedule"
      variant="outlined"
      value={schedule}
    />
  );

  const slackInput = (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">Send Slack Message</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={slackEnabled}
        label="Send Slack Message"
        onChange={setSlackEnabledVal}
      >
        <MenuItem value={true}>True</MenuItem>;
        <MenuItem value={false}>False</MenuItem>;
      </Select>
    </FormControl>
  );

  return (
    <div>
      <div className="edit-page">
        <div className="edit-inputs">
          {(mode === "edit" && tasks.length == 1) ||
            (mode === "add" &&
              wrapSingleEdit("vertical-input", "Task Name", nameInput))}

          {mode === "edit" &&
            tasks.length == 1 &&
            wrapSingleEdit("vertical-input", "Task Name", nameInput)}

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
            <Button variant="outlined" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              color="primary"
              variant="outlined"
              disabled={!isValid}
              onClick={onSave}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
