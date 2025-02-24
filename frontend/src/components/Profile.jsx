import React from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Button from "@mui/material/Button";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Profile = () => {
  /*
  State variables to manage form inputs and other UI states
  1.Store user's email address
  2.Default notification days before expiry
  3.current password entered by user 
  4.New password entered by the user
  5.confirmation of the new password
  6.Toggles password visibility
  7.Toggles snackbar visibility
  8.Store the message for the snackbar
  */
  const [email, setEmail] = React.useState("");  
  const [daysNotify, setDaysNotify] = React.useState(3);
  const [password, setPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newPasswordConfirmed, setNewPasswordConfirmed] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showSnackbar, setShowSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  // React Router's navigation function 
  const navigate = useNavigate();
  // srore the user's upload profile image
  const [image, setImage] = React.useState(null);
  // url preview of the upload profile image and name of the upload image file
  const [imagepreview, setimagepreview] = React.useState(null);
  const [imageName, setimageName] = React.useState(null);

  // Fetch profile details and profile picture when the component mounts
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get the authentication token and Fetch profile details
        const token = localStorage.getItem("token");
        const response = await fetch("http://localhost:5005/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,  //Include the token in the Authorization header
            "Content-Type": "application/json",
          },
        });
        // Update email field with the fetched data and default notification days
        if (response.ok) {
          const data = await response.json();
          setEmail(data.email);
          setDaysNotify(data.default_days);
        // fetch error message
        } else {
          console.error("Failed to fetch profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
      try {
        // Get the token again for fetching the profile image
        const token = localStorage.getItem("token");
        // Fetch profile picture
        const response = await fetch(
          "http://localhost:5005/profile/picture/view",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,  // Include token for authorization
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          // Get the binary image data
          const data = await response.blob();
          setImage(data); // Store the image data
          const imageObjectURL = URL.createObjectURL(data); // Generate a preview URL
          setimagepreview(imageObjectURL); // Set the preview URL
        // fetch error message
        } else {
          console.error("Failed to fetch profile image data");
        }
      } catch (error) {
        console.error("Error fetching profile image:", error);
      }
    };
    // Call the function to fetch profile data
    // Empty dependency array ensures this runs once on component mount
    fetchProfile();
  }, []);

  // Toggle visibility of password fields
  // Prevent default behavior for mouse down on the password visibility icon
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  // Handle image file upload
  const handleImageUpdate = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name;

      const url = URL.createObjectURL(file);
      setImage(file);
      setimagepreview(url);
      console.log(url);
      setimageName(fileName);
    }
  };
   // Handle form submission to update profile details
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage
      console.log(token);
      // Send profile details update request
      const response = await fetch("http://localhost:5005/profile", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
          newpassword: newPassword,
          newpasswordconfirmation: newPasswordConfirmed,
          defaultdays: daysNotify,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // If profile details updated, upload the profile picture
        const imageUpload = new FormData();
        imageUpload.append("file", image); // Attach the image file
        try {
          console.log(token);
          const response = await fetch(
            "http://localhost:5005/profile/picture",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: imageUpload,
            }
          );
          // profile image updates success/error
          if (response.ok) {
            console.log("Profile image updated");
          } else {
            const errorData = await response.text();
            console.log("Error: ", errorData);
          }
        } catch (error) {
          console.error("Error updating profile image:", error);
        }

        console.log("Profile updated:", data);
        // Redirect to the history page
        navigate("/history");
      } else {
        const errorData = await response.text(); // Get the error message from the server
        setSnackbarMessage(errorData); // Display the error message in the Snackbar
        setShowSnackbar(true); // Show the Snackbar
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  // Cancel and redirect to the history page
  const handleCancel = () => {
    navigate("/history");
  };
  // render the profile form
  return (
    <div
      style={{
        padding: "10rem 0rem",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: "#ffffff",
      }}
    >
      <Box
        component="form"
        sx={{
          "& > :not(style)": {
            m: 1,
            width: "90%",
          },
        }}
        noValidate
        autoComplete="off"
        style={{
          width: "80%",
          maxWidth: "30rem",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Profile image */}
        <Avatar
          alt="Profile Image"
          src={imagepreview}
          style={{ width: "15rem", height: "15rem" }}
          imgProps={{ name: imageName }}
        />
        {/* Button to upload a new profile picture */}
        <Button
          id="AvatarBotton"
          variant="contained"
          component="label"
          fullWidth
          startIcon={<CloudUploadIcon />}
          sx={{ marginTop: 1 }}
        >
          Upload Avatar
          <input type="file" hidden onChange={handleImageUpdate} />
        </Button>
        {/* Form fields for profile email */}
        <TextField
          id="email"
          required
          label="Email"
          variant="outlined"
          value={email || ""}
          onChange={(e) => setEmail(e.target.value)}
        />
        {/* Form fields for profile password */}
        <FormControl variant="outlined" required>
          <InputLabel>Password</InputLabel>
          <OutlinedInput
            id="OldPassword"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          />
        </FormControl>
        {/* Form fields for profile new password */}
        <FormControl variant="outlined" required>
          <InputLabel>New Password</InputLabel>
          <OutlinedInput
            type={showPassword ? "text" : "password"}
            value={newPassword || ""}
            onChange={(e) => setNewPassword(e.target.value)}
            id="New_Password"
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
          />
        </FormControl>
        {/* Form fields for profile new password confirmation */}
        <FormControl variant="outlined" required>
          <InputLabel>New Password Confirmation</InputLabel>
          <OutlinedInput
            type={showPassword ? "text" : "password"}
            value={newPasswordConfirmed || ""}
            onChange={(e) => setNewPasswordConfirmed(e.target.value)}
            id="New_Password_Confirmation"
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
          />
        </FormControl>
        {/* Form fields for profile notificationTime */}
        <TextField
          id="notificationTime"
          required
          label="Notify Days before Expiry"
          variant="outlined"
          type="number"
          value={daysNotify || ""}
          onChange={(e) => setDaysNotify(e.target.value)}
        />
        {/* add submit button */}
        <Button variant="outlined" onClick={handleSubmit} id="SubmitBotton">
          Submit
        </Button>
        {/* add cancel button */}
        <Button variant="outlined" onClick={handleCancel} id="CancelBotton">
          Cancel
        </Button>
      </Box>
      {/* Snackbar to display error messages */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity="error">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Profile;