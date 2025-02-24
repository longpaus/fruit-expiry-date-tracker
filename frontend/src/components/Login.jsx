import React from "react";
import { useNavigate } from "react-router-dom";

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputLabel from '@mui/material/InputLabel'
import InputAdornment from '@mui/material/InputAdornment'
import FormControl from '@mui/material/FormControl'
import TextField from '@mui/material/TextField'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'

export default function Login(props) {
  /* State variables to manage form inputs and UI behavior
    1.store the user email input
    2.store the user password input
    3.toggles password visibility
    4.manages Snackbar visibility
    5.message to display in the snackbar
  */
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const navigate = useNavigate()
  const [openSnackbar, setOpenSnackbar] = React.useState(false)
  const [messageSnackbar, setMessageSnackbar] = React.useState('')
  const [showPassword, setShowPassword] = React.useState(false)
  // Toggles the password field visibility
  const handleClickShowPassword = () => setShowPassword((show) => !show)
  // Prevents default behavior on mouse down
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  // Redirects user to the history page if they are already logged in 
  React.useEffect(() => {
    if (props.token) {
      navigate("/history");
    }
  }, [props.token]);
  // function to handle login
  const login = async () => {
    console.log(email, password);
    // send a POST request to the login API
    try {
      const response = await fetch("http://localhost:5005/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
        // Inform the server the request body is JSON
        headers: {
          "Content-type": "application/json",
        },
      });
      // Parse JSON response from the server
      const data = await response.json();
      // Display error message from the server
      if (data.error) {
        alert(data.error);
      } else if (data.access_token) {
        // On successful login, save the token to localStorage and update the parent state
        localStorage.setItem('token', data.access_token)
        props.setToken(data.access_token)
      }
    } catch (error) {
      // show error message in snackbar
      setOpenSnackbar(true)
      setMessageSnackbar('email not exist or password not correct')
    }
  };
  // Function to cancel the login and redirect to the landing page
  const Cancel = () => {
    navigate('/landpage')
  }
  // Function to close the Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }
  // Render the login form and UI components
  return (
    <div
      className="registerPage"
      style={{
        // border: '1px solid red',
        display: "flex",
        height: "80vh",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
      }}
    >
      <Box
        component="form"
        sx={{
          "& > :not(style)": {
            m: 1,
            width: "90%",
            maxWidth: "30rem",
          },
        }}
        noValidate
        autoComplete="off"
        style={{
          padding: "1rem",
          width: "80%",
          maxWidth: "30rem",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#ffffff",
        }}
      >
        <h2>Login</h2>
        {/* Input field for email */}
        <TextField
          id="email"
          required
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Input field for password with visibility toggle */}
        <FormControl variant="outlined" required>
          <InputLabel htmlFor="outlined-adornment-password">
            Password
          </InputLabel>
          <OutlinedInput
            id="outlined-adornment-password"
            data-testid="outlined-adornment-password"
            type={showPassword ? "text" : "password"}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
            value={password}
            required={true}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormControl>
        {/* Submit button */}
        <Button variant="outlined" id="login" onClick={login}>
          Submit
        </Button>
        {/* Cancel button */}
        <Button variant="outlined" onClick={Cancel} id="cancelButton">
          Cancel
        </Button>
      </Box>
      {/* Snackbar to display login errors */}
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}>
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}>
          {messageSnackbar}
        </Alert>
      </Snackbar>
    </div>
  );
}
