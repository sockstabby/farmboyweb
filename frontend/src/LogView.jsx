import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaSearch } from "react-icons/fa";

export function LogView({ logData }) {
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
    grid.current.api.setQuickFilter(text);
  };

  useEffect(() => {
    return () => {
      // to do: save off the state of the columns
      console.log("grid.current", grid.current);
    };
  }, []);

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
