import React, { useState } from "react";
import { Box, Typography } from "@mui/material";

const Landpage = () => {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        overflow: "auto",
      }}
    >
      <Typography variant="h1" align="center">
        Welcome!
      </Typography>
      <Typography variant="h5" align="center" style={{ paddingTop: "20%" }}>
        This service is capable of predicting the freshness for Red Apples,
        Oranges, Strawberries, Mangos, and Bananas
      </Typography>
    </Box>
  );
};

export default Landpage;
