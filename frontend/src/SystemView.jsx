import { useState, useEffect, useRef, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { FaSearch } from "react-icons/fa";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export function SystemView({ taskData }) {
  const grid = useRef();

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
