import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

export default function NotifDates(props) {
  const [days, setDays] = React.useState(0);

  const handleSetNotifDate = (event) => {
    setDays(event.target.value);
  };

  return (
    <Modal open={props.modalOpen}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "30%",
          bgcolor: "background.paper",
          padding: "2rem",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h2>Notification Days</h2>
        <Typography
          style={{
            width: "90%",
          }}
        >
          Please input the number of days you would like to be notified prior to
          the expiry date of the product.
        </Typography>
        <Typography
          style={{
            width: "90%",
          }}
        >
          Fruit Type: {props.row.fruitType}
          <br />
          Image Id: {props.row.imageId}
          <br />
          Purchase Date: {props.row.purchaseDate}
        </Typography>
        <TextField
          label="Number of Days"
          type="number"
          variant="filled"
          id="notification-dates"
          onChange={handleSetNotifDate}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          style={{
            width: "90%",
          }}
        />
        <Button
          variant="outlined"
          id="submit-update-notif"
          onClick={() => {
            props.changeNotifDate(props.row.imageId, days);
            props.modalClose();
          }}
          style={{
            width: "90%",
          }}
        >
          Submit
        </Button>
        <Button
          variant="outlined"
          id="cancel-update-notif"
          onClick={props.modalClose}
          style={{
            width: "90%",
          }}
        >
          Cancel
        </Button>
      </Box>
    </Modal>
  );
}
