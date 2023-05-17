import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import { useNavigate } from "react-router-dom";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";

import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { InputAdornment } from "@mui/material";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import { TaskEdit } from "./TaskEdit.jsx";

export function Tasks({ taskMetaData }) {
  const [rowData, setRowData] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [mode, setMode] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(-1);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

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
    setConfirmDeleteOpen(false);
    setSelectedRow(-1);
  };

  const filterGrid = (e) => {
    const text = e.target.value;

    setFilterText(text);
    grid.current.api.setQuickFilter(text);
  };

  const options = { sortable: true, filter: true };
  const setDefaultColDef = useMemo(() => options, []);

  console.log("render");

  async function handleClose(save = false) {
    console.log("handling close save = ", save);
    setOpen(false);

    if (save) {
      await new Promise((r) => setTimeout(r, 200));
      axios.get("/api/tasks").then((response) => {
        console.log("response = ", response.data.data);
        setRowData(response.data.data);
      });
    }
  }

  return (
    <>
      <div className="grid-controls">
        <div>
          <TextField
            id="search"
            type="search"
            label="Filter Tasks"
            value={filterText}
            onChange={filterGrid}
            sx={{ width: 600 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>

        <div className="grid-buttons">
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
          onClick={() => {
            setConfirmDeleteOpen(true);
          }}
        >
          Delete Selected Items
        </Button>{" "}
      </div>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting a task will remove a task from the scheduler. If the task
            is executing it will continue to run, but it wont ever run again.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>No</Button>
          <Button onClick={removeTask} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {" "}
          {mode === "add" ? "Add New Task" : "Edit Task(s)"}{" "}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {mode === "edit" &&
              "When editing multiple tasks, only checked items will be save to all selected tasks.  "}
            The schedule is based on the cron tab syntax. For examples please
            see <Link> https://crontab.guru/. </Link>
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
