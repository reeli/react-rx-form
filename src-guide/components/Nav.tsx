import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import MenuList from "@material-ui/core/MenuList/MenuList";
import Paper from "@material-ui/core/Paper/Paper";
import * as React from "react";
import { Link } from "react-router-dom";
import { req } from "../AppRoutes";

export const Nav = () => {
  return (
    <Paper square={true}>
      <MenuList>
        <MenuItem>
          <h3>React Rx Form</h3>
        </MenuItem>
        {req.keys().map((key: string) => {
          const path = key.split(".")[1];
          return (
            <Link to={path} key={key} style={{ textDecoration: "none" }}>
              <MenuItem>{path.split("/")[1]}</MenuItem>
            </Link>
          );
        })}
      </MenuList>
    </Paper>
  );
};
