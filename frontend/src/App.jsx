import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { Tasks } from "./Tasks.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import reactLogo from "./assets/react.svg";
import { TaskEdit } from "./TaskEdit.jsx";
import { SystemView } from "./SystemView.jsx";
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

  const [availableTasks, setAvailableTasks] = useState([]);

  const rowsRef = useRef(logData);

  function fetchTaskState() {
    axios.get("/api/taskstate").then((response) => {
      const runningTasks = response.data.taskinfo;

      const withTimeElapsed = runningTasks.map((i) => {
        const tokens = i.time_started.split("+");
        const ts = tokens[0]; // + "Z";

        var timeStarted = moment(ts);
        var now = moment();

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

function TasksPage() {
  return <Tasks />;
}

function MainApp({ logData, taskData, taskMetaData }) {
  const [location, setLocation] = useState(window.location.pathname);

  function setLocationProp(loc) {
    setLocation(window.location.pathname);
  }

  console.log("window location", window.location.pathname);
  return (
    <BrowserRouter basename="app">
      <div>
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
          <Container>
            <img
              src={reactLogo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            />
            <Navbar.Brand href="#home">Farm Boy</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />

            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="me-auto">
                <Link
                  onClick={setLocationProp}
                  className={`nav-link${
                    window.location.pathname === "/app" ? " active" : ""
                  }`}
                  to="/"
                >
                  Tasks
                </Link>
                <Link
                  onClick={setLocationProp}
                  className={`nav-link${
                    window.location.pathname === "/app/system" ? " active" : ""
                  }`}
                  to="/system"
                >
                  System
                </Link>
                <Link
                  onClick={setLocationProp}
                  className={`nav-link${
                    window.location.pathname === "/app/logs" ? " active" : ""
                  }`}
                  to="/logs"
                >
                  Logs
                </Link>
                <Link
                  onClick={setLocationProp}
                  className={`nav-link ${
                    window.location.pathname === "/alerts" ? " active" : ""
                  }`}
                  to="/tasks"
                >
                  Alerts
                </Link>
              </Nav>
              <Nav>
                <Nav.Link href="#deets">More deets</Nav.Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <div className="main">
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="tasks" element={<TasksPage />} />
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
            <p>Footer placeholder</p>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
