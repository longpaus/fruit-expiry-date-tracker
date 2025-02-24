import React from "react";
import Typography from "@mui/material/Typography";

// The footer and disclaimer section of the system
const Footer = () => {
  return (
    <Typography
      variant="caption"
      display="block"
      gutterBottom
      sx={{
        textAlign: "center",
        height: "2px",
      }}
    >
      Freshness Prediction Engine - COMP3900H11ADigitalHaven 2024 ©
    </Typography>
  );
};

export default Footer;
