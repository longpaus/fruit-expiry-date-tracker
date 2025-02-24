import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";

// A view details page presents all the details of a selected product
export default function DetailsPage(props) {
  return (
    <Modal open={props.detailsOpen}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          bgcolor: "background.paper",
          padding: "2rem",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h2>Details</h2>
        <Typography
          style={{
            width: "100%",
          }}
        >
          The following are the details of your product.
        </Typography>
        <Typography
          style={{
            width: "100%",
          }}
        >
          Fruit Type: {props.row.fruitType}
          <br />
          Image Id: {props.row.imageId}
          <br />
          Purchase Date: {dayjs(props.row.purchaseDate).format("YYYY-MM-DD")}
          <br />
          Upload Time: {props.row.uploadTime}
          <br />
          Storage Temperature: {props.row.temperature}
          <br />
          Storage Humidity: {props.row.humidity}
          <br />
          Predicted Expiry Date:{" "}
          {props.row.expiryDate
            ? props.row.expiryDate
            : "Please wait, prediction in progress..."}
          <br />
          Notification Time (Days before predicted expiry):{" "}
          {props.row.daysNotify}
          <br />
          Have the product been consumed: {props.row.consumed ? "Yes" : "No"}
          {props.row.consumed ? (
            <>
              <br />
              Consumed Date:{" "}
              {dayjs(props.row.consumedDate).format("YYYY-MM-DD")}
            </>
          ) : (
            <></>
          )}
          <br />
          Have the product been disposed: {props.row.disposed ? "Yes" : "No"}
          {props.row.disposed ? (
            <>
              <br />
              Disposed Date:{" "}
              {dayjs(props.row.disposedDate).format("YYYY-MM-DD")}
            </>
          ) : (
            <></>
          )}
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: 550,
            display: "flex",
            border: "2px dashed red",
            borderRadius: "10px",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <img src={props.modalImage} alt="Uploaded" />
        </Box>
        <Button
          variant="outlined"
          onClick={props.detailsClose}
          style={{
            width: "100%",
          }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
}
