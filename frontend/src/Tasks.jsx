import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import Button from "react-bootstrap/Button";
import { useNavigate } from "react-router-dom";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import { FaThumbsUp } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";

import { FaEdit } from "react-icons/fa";

import { FaSearch } from "react-icons/fa";

export function Tasks() {
  const [rowData, setRowData] = useState([]);

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

  const addTask = () => {
    console.log("add button clicked", getSelectedRowData());
    navigate("/add-task");
  };

  const editTask = () => {
    console.log("edit button clicked", getSelectedRowData());
    navigate("/edit-task", { state: getSelectedRowData() });
  };

  const getSelectedRowData = () => {
    const selectedData = grid.current.api.getSelectedRows();
    return selectedData;
  };

  const rowSelected = (e) => {
    if (!e.node.selected) return;
    console.log("row selected", e.rowIndex);

    setSelectedRow(e.rowIndex);
  };

  const removeTask = () => {
    console.log("remove button clicked");

    console.log(getSelectedRowData());
  };

  const filterGrid = (e) => {
    const text = e.target.value;

    grid.current.api.setQuickFilter(text);
  };

  const options = { sortable: true, filter: true };
  const setDefaultColDef = useMemo(() => options, []);

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
          <Button variant="light" onClick={addTask}>
            <FaPlus />
          </Button>

          <Button
            variant="light"
            disabled={selectedRow === -1}
            onClick={editTask}
          >
            <FaEdit />
          </Button>
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
          onRowSelected={rowSelected}
        ></AgGridReact>
      </div>
      <div className="grid-footer-controls">
        <Button variant="outline-danger" onClick={removeTask}>
          Delete Selected Items
        </Button>{" "}
      </div>
    </>
  );
}
