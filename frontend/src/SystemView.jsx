import { useState, useEffect, useRef, useMemo } from "react";

import { useNavigate, useLocation } from "react-router-dom";
import Form from "react-bootstrap/Form";

import { AgGridReact } from "ag-grid-react";
import Button from "react-bootstrap/Button";
import { FaSearch } from "react-icons/fa";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import "bootstrap/dist/css/bootstrap.min.css";

import { Socket } from "./phoenix.js";

let socket = new Socket("/socket", { params: { token: "MYTOKEN" } });
socket.connect();

export function SystemView({ mode }) {
  const grid = useRef();

  const channelRef = useRef(null);
  const navigate = useNavigate();

  const [columnDefs] = useState([
    { field: "node", headerName: "Node Name" },
    { field: "taskName", taskName: "Task Name" },
    { field: "startTime", startTime: "Start Time" },
  ]);

  const [rowData, setRowData] = useState([]);
  const options = { sortable: true, filter: true };
  const setDefaultColDef = useMemo(() => options, []);

  function addRowItem() {
    const possibleNodes = ["Node 1", "Node 2", "Node 3"];
    const possibleTasks = ["Task 1", "Task 2", "Task 3", "Task4", "Task 5"];

    let random = Math.random() * 10;
    const nodeIndex = Math.floor(random % possibleNodes.length);

    random = Math.random() * 10;
    const taskIndex = Math.floor(random % possibleTasks.length);

    console.log("nodeIndex = ", nodeIndex);
    console.log("taskIndex = ", taskIndex);

    const current = [
      ...rowData,
      {
        node: possibleNodes[nodeIndex],
        taskName: possibleTasks[taskIndex],
        startTime: "safas",
      },
    ];

    setRowData(current);
  }

  useEffect(() => {
    setTimeout(() => {
      addRowItem();
    }, 1000 * 2);
  });

  function receivedMessage(msg, payload) {}

  useEffect(() => {
    function joinRoom() {
      console.log("joining");
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
        console.log("got a message", payload);
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
