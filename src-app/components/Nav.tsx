import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import * as React from "react";
import { req } from "../AppRoutes";

export const Nav = () => {
  return (
    <>
      <List component="nav">
        {req.keys().map((key: string) => {
          const path = key.split(".")[1];
          return (
            <ListItem key={key} button>
              <ListItemText>
                <a href={path} style={{ textDecoration: "none", color: "#000", display: "block" }}>
                  {path.split("/")[1]}
                </a>
              </ListItemText>
            </ListItem>
          );
        })}
      </List>
    </>
  );
};
