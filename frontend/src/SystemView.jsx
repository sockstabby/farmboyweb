import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";

import { useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";

import { AgGridReact } from "ag-grid-react";
import Button from "react-bootstrap/Button";
import { FaSearch } from "react-icons/fa";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "bootstrap/dist/css/bootstrap.min.css";

import moment from "moment";

import { Socket } from "./phoenix.js";

let socket = new Socket("/socket", { params: { token: "MYTOKEN" } });
socket.connect();

export function SystemView({ mode }) {
  const grid = useRef();

  const channelRef = useRef(null);
  const navigate = useNavigate();

  const [columnDefs] = useState([
    { field: "worker", startTime: "Node" },
    { field: "method", taskName: "Method" },
    { field: "args", headerName: "Config" },
    { field: "timeElapsed", headerName: "Elapsed Time" },
  ]);

  const [rowData, setRowData] = useState([]);
  const options = { sortable: true, filter: true };
  const setDefaultColDef = useMemo(() => options, []);

  function fetchTaskState() {
    console.log("AEee!");
    axios.get("/api/taskstate").then((response) => {
      console.log("/api/taskstate response =", response.data);

      const runningTasks = response.data.taskinfo;

      const withTimeElapsed = runningTasks.map((i) => {
        const tokens = i.time_started.split("+");
        const ts = tokens[0]; // + "Z";
        console.log("timeStarted parsed str = ", ts);

        var timeStarted = moment(ts);
        var now = moment();

        const duration = now.diff(timeStarted, "seconds"); // 1

        return { ...i, ...{ timeElapsed: `${duration}` } };
      });

      setRowData(withTimeElapsed);
    });
  }

  useEffect(() => {
    setTimeout(() => {
      fetchTaskState();
    }, 1000 * 2);
  });

  const filterGrid = (e) => {
    const text = e.target.value;
    grid.current.api.setQuickFilter(text);
  };

  return (
    <>
      <div className="grid-controls">
        <div>
          <FaSearch />
          <input
            type="search"
            onChange={filterGrid}
            placeholder="Filter Tasks..."
          ></input>
        </div>
      </div>

      <div className="ag-theme-alpine">
        <AgGridReact
          ref={grid}
          defaultColDef={setDefaultColDef}
          rowData={rowData}
          rowSelection="single"
          columnDefs={columnDefs}
          rowHeight={30}
          suppressScrollOnNewData={true}
        ></AgGridReact>
      </div>
    </>
  );
}
