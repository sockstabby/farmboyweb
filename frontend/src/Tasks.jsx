import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import Button from "@mui/material/Button";

import { useNavigate } from "react-router-dom";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { FaPlus } from "react-icons/fa";

import { FaSearch } from "react-icons/fa";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { TaskEdit } from "./TaskEdit.jsx";

import TextField from "@mui/material/TextField";

export function Tasks({ taskMetaData }) {
  const [rowData, setRowData] = useState([]);

  const [mode, setMode] = useState(null);

  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(-1);

  const grid = useRef();
  const navigate = useNavigate();

  const [columnDefs] = useState([
    { field: "name" },
    { field: "taskid" },
    { field: "schedule" },
    { field: "enabled" },
    { field: "config" },
    { field: "slack" },
  ]);

  useEffect(() => {
    axios.get("/api/tasks").then((response) => {
      setRowData(response.data.data);
    });
  }, []);

  async function removeTasks(tasks) {
    const responses = [];

    console.log("tasks= ", tasks);

    tasks.forEach(async (task) => {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      axios.get("/api/tasks").then((response) => {
        setRowData(response.data.data);
      });

      responses.push(response);
    });
  }

  const addTask = () => {
    setMode("add");
    setOpen(true);
  };

  const editTask = () => {
    setMode("edit");
    setOpen(true);
  };

  const getSelectedRowData = () => {
    if (grid && grid.current) {
      const selectedData = grid.current.api.getSelectedRows();
      return selectedData;
    }
    return [];
  };

  const rowSelected = (e) => {
    if (!e.node.selected) return;

    setSelectedRow(e.rowIndex);
  };

  const removeTask = () => {
    removeTasks(getSelectedRowData());
    setSelectedRow(-1);
  };

  const filterGrid = (e) => {
    const text = e.target.value;
    grid.current.api.setQuickFilter(text);
  };

  const options = { sortable: true, filter: true };
  const setDefaultColDef = useMemo(() => options, []);

  const handleClose = () => {
    setOpen(false);
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

        <div>
          <Button variant="outlined" onClick={addTask}>
            Add Task
          </Button>{" "}
          <Button
            variant="outlined"
            disabled={selectedRow === -1}
            onClick={editTask}
          >
            Edit Items
          </Button>{" "}
        </div>
      </div>
      <div className="ag-theme-alpine">
        <AgGridReact
          ref={grid}
          defaultColDef={setDefaultColDef}
          rowData={rowData}
          rowSelection="multiple"
          columnDefs={columnDefs}
          rowHeight={30}
          onRowSelected={rowSelected}
        ></AgGridReact>
      </div>
      <div className="grid-footer-controls">
        <Button
          variant="outlined"
          disabled={selectedRow === -1}
          onClick={removeTask}
        >
          Delete Selected Items
        </Button>{" "}
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {" "}
          {mode === "add" ? "Add New Task" : "Edit Task(s)"}{" "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            To subscribe to this website, please enter your email address here.
            We will send updates occasionally.
          </DialogContentText>

          <TaskEdit
            mode={mode}
            onClose={handleClose}
            taskMetaData={taskMetaData}
            items={getSelectedRowData()}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
