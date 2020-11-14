import React from "react";
import ReactDOM from "react-dom";
import './index.css';
import App from './App';
import CssBaseline from "@material-ui/core/CssBaseline";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";

const themeLight = createMuiTheme({
  palette: {
    background: {
      default: "#e4f0e2"
    }
  }
});

const themeDark = createMuiTheme({
  palette: {
    background: {
      default: "#222222"
    },
    text: {
        default: "#ffffff",
        primary: "#0ee565"
    }
  }
});

const AppRoot = () => {
  const [light, setLight] = React.useState(true);
  return (
    <MuiThemeProvider theme={light ? themeDark : themeLight}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<AppRoot />, rootElement);