import { useState, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import TextField from "@mui/material/TextField";
import { InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export function LogView({ logData }) {
  const [filterText, setFilterText] = useState("");
  const grid = useRef();

  const [columnDefs] = useState([
    { field: "node", headerName: "Node Name", resizable: true },
    { field: "message", taskName: "Message", resizable: true },
    { field: "taskName", taskName: "Task Name", resizable: true },
    { field: "id", headerName: "Task Instance", resizable: true },
    { field: "timestamp", headerName: "Timestamp", resizable: true },
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
          rowData={logData}
          rowSelection="single"
          columnDefs={columnDefs}
          rowHeight={30}
          suppressScrollOnNewData={true}
        ></AgGridReact>
      </div>
    </>
  );
}
