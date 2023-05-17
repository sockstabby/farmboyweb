import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { useNavigate, useLocation } from "react-router-dom";

const tabLinks = {
  0: "/",
  1: "/system",
  2: "/logs",
};

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    navigate(tabLinks[newValue]);
    console.log("newvalue = ", newValue);
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "auto" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab label="Tasks" />
        <Tab label="System" />
        <Tab label="Logs" />
      </Tabs>
    </Box>
  );
}
