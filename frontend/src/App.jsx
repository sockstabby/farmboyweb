import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import Typography from "@mui/material/Typography";
import AgricultureIcon from "@mui/icons-material/Agriculture";

import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { Tasks } from "./Tasks.jsx";
import { TaskEdit } from "./TaskEdit.jsx";
import { SystemView } from "./SystemView.jsx";
import Tabs from "./MyTabpanel.jsx";
import { LogView } from "./LogView.jsx";
import moment from "moment";
import axios from "axios";
import { Socket } from "./phoenix.js";

let socket = new Socket("/socket", { params: { token: "MYTOKEN" } });
socket.connect();

function App() {
  const channelRef = useRef(null);

  const [logData, setLogData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [taskMetaData, setTaskMetaData] = useState([]);
  const [taskStateTick, setTaskStateTick] = useState(0);

  const rowsRef = useRef(logData);

  function fetchTaskState() {
    axios.get("/api/taskstate").then((response) => {
      const runningTasks = response.data.taskinfo;

      const withTimeElapsed = runningTasks.map((i) => {
        const tokens = i.time_started.split("+");
        const ts = tokens[0]; // + "Z";

        const dt = new Date();
        const tz = dt.getTimezoneOffset();

        var timeStarted = moment(ts);
        var now = moment().add(tz, "minutes");

        const duration = now.diff(timeStarted, "seconds");
        return { ...i, ...{ timeElapsed: `${duration}` } };
      });

      const workers = Object.keys(response.data.worker_details);

      const tasks = workers.reduce((acc, current) => {
        const workerTasks = response.data.worker_details[current];
        return [...acc, ...workerTasks];
      }, []);

      const taskMap = tasks.reduce((acc, task) => {
        return { ...acc, ...{ [task.taskid]: task } };
      }, {});

      console.log("running tasks", withTimeElapsed);

      setTaskMetaData(Object.values(taskMap));
      setTaskData(withTimeElapsed);
    });
  }

  function receivedMessage(msg, payload) {
    var now = moment();

    const newRowData = [
      ...rowsRef.current,
      {
        id: payload.id,
        taskName: payload.method,
        message: payload.message,
        node: payload.node,
        timestamp: moment().toISOString(),
      },
    ];

    rowsRef.current = newRowData;
    setLogData(newRowData);
  }

  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.replace("/app");
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      fetchTaskState();
      setTaskStateTick(taskStateTick + 1);
    }, 1000 * 5);
  }, [taskStateTick]);

  useEffect(() => {
    function joinRoom() {
      const channel = socket.channel("room:123", {});
      channelRef.current = channel;

      channel
        .join()
        .receive("ok", (resp) => {
          console.log("Joined successfully", resp);
        })
        .receive("error", (resp) => {
          console.log("Unable to join", resp);
        });

      channel.on("new_msg", (payload) => {
        receivedMessage("new_msg", payload);
      });
    }
    joinRoom();
    return () => {
      if (channelRef.current) {
        console.log("leaving");
        channelRef.current.leave();
      }
    };
  }, []);

  return (
    <MainApp
      logData={rowsRef.current}
      taskData={taskData}
      taskMetaData={taskMetaData}
    />
  );
}

function MainApp({ logData, taskData, taskMetaData }) {
  return (
    <BrowserRouter basename="app">
      <div className="app-body">
        <div className="main-nav">
          <div className="main-title">
            <AgricultureIcon />
            <Typography variant="h5">FarmBoy</Typography>
          </div>
          <Tabs />
        </div>
        <div className="main">
          <Routes>
            <Route path="/" element={<Tasks taskMetaData={taskMetaData} />} />
            <Route
              path="tasks"
              element={<Tasks taskMetaData={taskMetaData} />}
            />
            <Route
              path="edit-task"
              element={<TaskEdit mode="edit" taskMetaData={taskMetaData} />}
            />
            <Route
              path="add-task"
              element={<TaskEdit mode="add" taskMetaData={taskMetaData} />}
            />
            <Route path="system" element={<SystemView taskData={taskData} />} />
            <Route path="logs" element={<LogView logData={logData} />} />
          </Routes>
        </div>

        <div className="footer">
          <div className="footer-text-container">
            <Typography variant="caption" display="block">
              {`${taskData.length} tasks running`}
            </Typography>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
