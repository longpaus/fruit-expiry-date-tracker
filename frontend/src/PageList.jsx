import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import RestoreIcon from "@mui/icons-material/Restore";

import Footer from "./components/Footer";
import Login from "./components/Login";
import Register from "./components/Register";
import History from "./components/History";
import Prediction from "./components/Prediction";
import Profile from "./components/Profile";
import Landpage from "./components/Landpage";

const PageList = () => {
  // State for storing the user's authentication token and email
  const [token, setToken] = React.useState(null);
  const [email, setEmail] = React.useState("");
  // For programmatic navigation
  const navigate = useNavigate();
  // Check if a token exists in localStorage when the component mounts
  React.useEffect(() => {
    const checktoken = localStorage.getItem("token");
    if (checktoken) {
      setToken(checktoken); // Set token in state
      setEmail(localStorage.getItem("email")); // Set email in state
    }
  }, []);
  // Logout function that clears token and email from localStorage and updates state
  const logout = async () => {
    const response = await fetch("http://localhost:5005/logout", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response;
    console.log(data);
    // Check if the logout was successful
    if (data.status !== 200) {
      console.log("Logout Error");
    } else {
      setToken(null); // Clear token from state
      localStorage.removeItem("token"); // Remove token from localStorage
      localStorage.removeItem("email"); // Remove email from localStorage
      navigate("/landpage"); // Redirect to the Landpage
    }
  };
  // Define the list of pages based on whether the user is logged in or not
  const pages = token
    ? ["Prediction", "History", "Profile", "Logout"]
    : ["Register", "Login"];

  // render the prediction form
  return (
    <>
      {/* Main content area */}
      <Box
        style={{
          height: "calc(100vh - 118px)",
          //border: "1px solid red",
          overflow: "auto",
        }}
      >
        {/* Define routes for each page */}
        <Routes>
          <Route path="/" element={<Landpage />} />
          <Route
            path="/history"
            element={<History token={token} setToken={setToken} />}
          />
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/landpage" element={<Landpage />} />
          <Route
            path="/register"
            element={<Register token={token} setToken={setToken} />}
          />
          <Route
            path="/login"
            element={<Login token={token} setToken={setToken} />}
          />
        </Routes>
      </Box>
      {/* Footer and Bottom Navigation */}
      <Box
        style={{
          height: "110px",
          // border: '1px solid red',
        }}
      >
        <hr />
        <Box>
          {/* Bottom Navigation for page switching */}
          <BottomNavigation
            showLabels
            value={""}
            onChange={(event, newValue) => {
              if (pages[newValue] === "Logout") {
                logout();
              } else {
                navigate(`/${pages[newValue].toLowerCase()}`);
              }
            }}
          >
            {/* Render BottomNavigationAction for each page */}
            {pages.map((page, idx) => {
              return (
                <BottomNavigationAction
                  label={page}
                  id={page}
                  icon={<RestoreIcon />}
                  key={idx}
                />
              );
            })}
          </BottomNavigation>
        </Box>
        <hr />
        {/* Footer component */}
        <Footer />
      </Box>
    </>
  );
};

export default PageList;

/*
 âœ… useState -- easy
 âœ… useEffect
 âœ… multiple files, components
 âœ… props
 âœ… routing & spas
 âœ… css framewrosk
 âœ… (refersher) fetch
*/