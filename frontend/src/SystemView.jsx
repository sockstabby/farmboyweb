import { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { FaSearch } from "react-icons/fa";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export function SystemView({ taskData }) {
  const grid = useRef();
  const [filterText, setFilterText] = useState("");

  const [columnDefs] = useState([
    { field: "worker", headerName: "Worker" },
    { field: "method", headerName: "Method" },
    { field: "args", headerName: "Config" },
    { field: "id", headerName: "Task Instance" },
    { field: "timeElapsed", headerName: "Elapsed Time" },
  ]);

  const options = { sortable: true, filter: true };
  const setDefaultColDef = useMemo(() => options, []);

  const filterGrid = (e) => {
    const text = e.target.value;
    setFilterText(text);
    grid.current.api.setQuickFilter(text);
  };

  return (
    <>
      <div className="grid-controls">
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

      <div className="ag-theme-alpine">
        <AgGridReact
          ref={grid}
          defaultColDef={setDefaultColDef}
          rowData={taskData}
          rowSelection="single"
          columnDefs={columnDefs}
          rowHeight={30}
          suppressScrollOnNewData={true}
        ></AgGridReact>
      </div>
    </>
  );
}
