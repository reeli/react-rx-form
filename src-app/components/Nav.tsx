import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import * as React from "react";
import { Link } from "react-router-dom";
import { req } from "../AppRoutes";

export const Nav = () => {
  return (
    <>
      <List component="nav" style={{ backgroundColor: "pink" }}>
        {req.keys().map((key: string) => {
          const path = key.split(".")[1];
          return (
            <Link to={path} style={{ textDecoration: "none", color: "#000", display: "block" }} key={key}>
              <ListItem button>
                <ListItemText>{path.split("/")[1]}</ListItemText>
              </ListItem>
            </Link>
          );
        })}
      </List>
    </>
  );
};
