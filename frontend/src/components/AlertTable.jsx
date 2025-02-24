import * as React from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import Modal from "@mui/material/Modal";
import Button from "@mui/material/Button";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import Typography from "@mui/material/Typography";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

// An alert table showing the list of products that are about to expire
export default function AlertTable(props) {
  return (
    <Modal open={props.alertOpen}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "60%",
          maxHeight: "50%",
          bgcolor: "background.paper",
          padding: "2rem",
          gap: "1rem",
          alignItems: "center",
        }}
      >
        <h2>Notification</h2>
        <Typography
          style={{
            width: "90%",
          }}
        >
          The following fresh products will expire shortly. Please consume them
          as soon as possible.
        </Typography>
        <TableContainer component={Paper} style={{ width: "90%" }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Image ID</TableCell>
                <TableCell align="center">Fruit Type</TableCell>
                <TableCell align="center">Purchase Date</TableCell>
                <TableCell align="center">Expiry Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.alertData.map((row) => (
                <TableRow key={row.imageId}>
                  <TableCell align="center">{row.imageId}</TableCell>
                  <TableCell align="center">{row.fruitType}</TableCell>
                  <TableCell align="center">{row.purchaseDate}</TableCell>
                  <TableCell align="center">{row.expiryDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Button
          variant="outlined"
          onClick={() => props.alertClose()}
          style={{
            width: "90%",
          }}
        >
          Close
        </Button>
      </Box>
    </Modal>
  );
}
