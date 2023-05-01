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

export function TaskEdit({ mode }) {
  const { state } = useLocation();

  const [name, setName] = useState(mode === "edit" ? state[0].name : "");
  const [enabled, setEnabled] = useState(
    mode === "edit" ? state[0].enabled : true
  );

  const [config, setConfig] = useState(
    mode === "edit" ? state[0].config : "{}"
  );
  const [schedule, setSchedule] = useState(
    mode === "edit" ? state[0].schedule : "* * * * *"
  );
  const [slackEnabled, setSlackEnabled] = useState(
    mode === "edit" ? state[0].slack : true
  );
  const [taskid, setTaskid] = useState(mode === "edit" ? state[0].taskid : 1);

  const navigate = useNavigate();
  const onSave = () => {
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

  return (
    <div>
      <div className="edit-page">
        <div className="edit-inputs">
          {mode === "edit" ? (
            <h5>Editing Existing Task</h5>
          ) : (
            <h5>Add New Task</h5>
          )}
          <div className="vertical-input">
            Task Name:
            <input type="text" value={name} onChange={setNameVal}></input>
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
