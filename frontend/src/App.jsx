import { useEffect } from "react";
import { BrowserRouter, Link, Routes, Route } from "react-router-dom";
import { Tasks } from "./Tasks.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";

import reactLogo from "./assets/react.svg";

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

  /*
  return (
    <div className="container">
      {" "}
      <div className="title-bar">
        <div>TaskMonger</div>

        <img src={reactLogo} className="logo" alt="Vite logo" />
      </div>
      <BrowserRouter basename="app">
        <div className="nav-bar">
          <nav className="links">
            <Link to="/">Home</Link>
            <Link to="/tasks">Tasks</Link>
            <br />
          </nav>
        </div>
        <div className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="tasks" element={<TasksPage />} />
          </Routes>
        </div>
        <div class="footer"></div>
      </BrowserRouter>
    </div>
  );
  */
}

function TasksPage() {
  return <Tasks />;
}

function HomePage() {
  return <div>Home</div>;
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
                <Link className="nav-link" to="/tasks">
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
            <Route path="/" element={<HomePage />} />
            <Route path="tasks" element={<TasksPage />} />
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
