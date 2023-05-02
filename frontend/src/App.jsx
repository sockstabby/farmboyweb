import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { Tasks } from "./Tasks.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import reactLogo from "./assets/react.svg";
import { TaskEdit } from "./TaskEdit.jsx";
import { SystemView } from "./SystemView.jsx";

import { Socket } from "./phoenix.js";

let socket = new Socket("/socket", { params: { token: "MYTOKEN" } });

socket.connect();

// Now that you are connected, you can join channels with a topic.
// Let's assume you have a channel with a topic named `room` and the
// subtopic is its id - in this case 42:
let channel = socket.channel("room:123", {});

channel
  .join()
  .receive("ok", (resp) => {
    console.log("Joined successfully", resp);
  })
  .receive("error", (resp) => {
    console.log("Unable to join", resp);
  });

channel.on("new_msg", (payload) => {
  console.log("got a message", payload);
});

function App() {
  /**
   * During development we can still access the base path at `/`
   * And this hook will make sure that we land on the base `/app`
   * path which will mount our App as usual.
   * In production, Phoenix makes sure that the `/app` route is
   * always mounted within the first request.
   * */
  useEffect(() => {
    if (window.location.pathname === "/") {
      window.location.replace("/app");
    }
  }, []);

  return CollapsibleExample();
}

function TasksPage() {
  return <Tasks />;
}

function CollapsibleExample() {
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
                <Link className="nav-link" to="/">
                  Tasks
                </Link>
                <Link className="nav-link" to="/system">
                  System
                </Link>
                <Link className="nav-link" to="/tasks">
                  Logs
                </Link>
                <Link className="nav-link" to="/tasks">
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
            <Route path="edit-task" element={<TaskEdit mode="edit" />} />
            <Route path="add-task" element={<TaskEdit mode="add" />} />
            <Route path="system" element={<SystemView />} />
          </Routes>
        </div>

        <div className="footer">
          <div className="footer-text-container">
            <p>Eric Peterson Copyright @2023</p>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
