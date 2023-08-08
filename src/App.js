import logo from "./logo.svg";
import { useEffect, useState } from "react";
import { Button, createTheme, ThemeProvider } from "@mui/material";
import "./App.css";
import Home from "./layouts/home/Home";
import { Route, Routes } from "react-router-dom";
import { useReactPWAInstall } from "react-pwa-install";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import CheckinReview from "./layouts/checkin/checkin-review/CheckinReview";
import CheckinAddons from "./layouts/checkin/checkin-addons/CheckinAddons";
import CheckinInfo from "./layouts/checkin/checkin-info/CheckinHome";

const theme = createTheme({
  palette: {
    primary: {
      main: "#FF0000", //process.env.REACT_APP_THEME_COLOR_PRIMARY,
    },
    secondary: {
      main: "#FF0000", //process.env.REACT_APP_THEME_COLOR_SECONDARY,
    },
    third: {
      main: "#FF0000", // process.env.REACT_APP_THEME_COLOR_THIRD,
    },
    danger: {
      main: "#FF0000",
    },
  },
});

function App() {
  const { pwaInstall, supported, isInstalled } = useReactPWAInstall();
  const isSupported = supported();
  const isAppInstalled = isInstalled();
  const [isBrowserMode, setBrowserMode] = useState(true);
  const [isTimedOut, setIsTimedOut] = useState(false);
  // const brandId = process.env.REACT_APP_BRAND_ID;

  const handleAppInstallMode = () => {
    pwaInstall({
      title: "Install Accor App",
      logo: logo,
      features: (
        <ul>
          <li className="mt-2">Check In contactlessly</li>
          <li className="mt-2">Pay with your E-Wallet</li>
          <li className="mt-2">Personalizations through your phone</li>
        </ul>
      ),
      description: "Luxury hospitality at your fingertips",
    })
      .then(() =>
        alert(
          "Installation successful, please return to device home screen to access the Accor Check-In App."
        )
      )
      .catch(() =>
        alert("You have opted out from installing the Accor Check-In App")
      );
  };

  const handleBrowserMode = () => {
    setBrowserMode(true);
  };

  useEffect(() => {
    setTimeout(() => {
      console.log("setTimedOut");
      setIsTimedOut(true);
    }, 1500);
  }, []);

  useEffect(() => {
    if (isTimedOut && !isSupported) {
      setBrowserMode(true);
    }
  }, [isTimedOut, isSupported]);

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="main">
          {isTimedOut && (
            <div className="content">
              {!isAppInstalled && !isBrowserMode && (
                <div className="rounded-box d-flex flex-column justify-content-between">
                  <div>
                    <h1 className="page-title text-center">Select App Mode</h1>
                    <div className="row">
                      {isSupported && (
                        <div className="col-md-12 my-3">
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAppInstallMode}
                            size="large"
                            className="w-100"
                          >
                            Install App
                          </Button>
                        </div>
                      )}
                      <div className="col-md-12 my-3">
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleBrowserMode}
                          size="large"
                          className="w-100"
                        >
                          Continue In Browser
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {(isAppInstalled || isBrowserMode) && (
                <Routes>
                  <Route index element={<Home />} />
                  <Route path="/checkin-info" element={<CheckinInfo />} />
                  <Route path="/checkin-addons" element={<CheckinAddons />} />
                  <Route path="/checkin-review" element={<CheckinReview />} />
                </Routes>
              )}
            </div>
          )}
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
