import * as React from "react";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { visuallyHidden } from "@mui/utils";
import Button from "@mui/material/Button";

import NotifDates from "./NotifDates";
import AlertTable from "./AlertTable";
import ConsumePage from "./ConsumePage";
import DisposalPage from "./DisposalPage";
import DetailsPage from "./DetailsPage";
import { useNavigate } from "react-router-dom";

// Table header of the prediction history table
function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  const headCells = [
    {
      id: "fruitType",
      label: "Product Label",
    },
    {
      id: "purchaseDate",
      label: "Purchase Date",
    },
    {
      id: "expiryDate",
      label: "Expiry Date",
    },
    {
      id: "daysNotify",
      label: "Notification (Days)",
    },
  ];

  return (
    <TableHead id="history-table-head">
      <TableRow>
        <TableCell align="center" padding="normal">
          No.
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="center"
            padding="normal"
            id={headCell.id}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell align="center" padding="normal">
          Status
        </TableCell>
        <TableCell align="center" padding="normal">
          Date
        </TableCell>
        <TableCell align="center" padding="normal">
          Action
        </TableCell>
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  onRequestSort: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

// A table which presents all prediction histories of the authenicated user
export default function EnhancedTable(props) {
  const [dense, setDense] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [alertData, setAlertData] = React.useState([]);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalRow, setModalRow] = React.useState({});
  const [modalImage, setModalImage] = React.useState(null);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [consumeOpen, setConsumeOpen] = React.useState(false);
  const [disposeOpen, setDisposeOpen] = React.useState(false);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    setRows(props.historyData);
    setAlertData(props.alertContent);
  }, [props.historyData]);
  //console.log(rows);

  const handleRequestSort = (event, property) => {
    const isAsc = props.orderBy === property && props.order === "asc";
    props.setOrder(isAsc ? "desc" : "asc");
    props.setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    props.setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    props.setRowsPerPage(parseInt(event.target.value, 10));
    props.setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    props.page > 0
      ? Math.max(0, (1 + props.page) * props.rowsPerPage - rows.length)
      : 0;

  async function getImage(imageId) {
    const response = await fetch(
      `http://localhost:5005/image?imageid=${imageId}`,
      {
        method: "GET",
      }
    );
    const data = await response.blob();
    const imageObjectURL = URL.createObjectURL(data);
    setModalImage(imageObjectURL);
  }

  const viewDetails = async (row) => {
    setModalRow(row);
    await getImage(row.imageId);
    setDetailsOpen(true);
    console.log(row);
  };

  const handleModalOpen = (row) => {
    setModalRow(row);
    setModalOpen(true);
  };
  const handleModalClose = () => setModalOpen(false);
  const handleAlertOpen = () => setAlertOpen(true);
  const handleAlertClose = () => setAlertOpen(false);
  const handleConsumeOpen = (row) => {
    if (!row.consumed) {
      setModalRow(row);
      setConsumeOpen(true);
    } else {
      props.unconsumeProduct(row.imageId);
    }
  };
  const handleConsumeClose = () => setConsumeOpen(false);
  const handleDisposeOpen = (row) => {
    if (!row.disposed) {
      setModalRow(row);
      setDisposeOpen(true);
    } else {
      props.undisposeProduct(row.imageId);
    }
  };
  const handleDisposeClose = () => setDisposeOpen(false);
  const handleDetailsClose = () => setDetailsOpen(false);

  return (
    <Box sx={{ width: "90%" }} id="history-table-body">
      <NotifDates
        id="notification-dates-page"
        modalOpen={modalOpen}
        modalClose={handleModalClose}
        row={modalRow}
        changeNotifDate={props.changeNotifDate}
      />
      <AlertTable
        id="alert-page"
        alertOpen={alertOpen}
        alertClose={handleAlertClose}
        alertData={alertData}
      />
      <ConsumePage
        id="consume-page"
        consumeOpen={consumeOpen}
        consumeClose={handleConsumeClose}
        consumeProduct={props.consumeProduct}
        row={modalRow}
      />
      <DisposalPage
        id="dispose-page"
        disposeOpen={disposeOpen}
        disposeClose={handleDisposeClose}
        disposeProduct={props.disposeProduct}
        row={modalRow}
      />
      <DetailsPage
        id="details-page"
        detailsOpen={detailsOpen}
        detailsClose={handleDetailsClose}
        row={modalRow}
        modalImage={modalImage}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <FormControlLabel
          style={{
            padding: "0.5rem",
            marginLeft: "0rem",
            background: "#f2f2f2",
            width: "15rem",
          }}
          control={<Checkbox />}
          id="hide-consumed-button"
          label="Hide Consumed Products"
          onChange={() => props.controlHideConsumed()}
        />
        <FormControlLabel
          style={{
            padding: "0.5rem",
            marginLeft: "0rem",
            background: "#f2f2f2",
            width: "15rem",
          }}
          control={<Checkbox />}
          id="hide-disposed-button"
          label="Hide Disposed Products"
          onChange={() => props.controlHideDisposed()}
        />
        <div
          style={{
            //border: "solid, 1px black",
            width: "calc(100% - 30rem - 10rem)",
          }}
        ></div>
        {alertData.length > 0 ? (
          <Button
            //variant="outlined"
            style={{
              height: "3.5rem",
              width: "10rem",
              backgroundColor: "#fc9b9d",
              color: "black",
            }}
            id="alert-page"
            onClick={() => handleAlertOpen()}
          >
            Open Alert
          </Button>
        ) : null}
      </div>

      <Paper sx={{ width: "100%", marginTop: "1rem" }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? "small" : "medium"}
          >
            <EnhancedTableHead
              order={props.order}
              orderBy={props.orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody id="history-table-content">
              {rows.map((row, idx) => {
                return (
                  <TableRow hover tabIndex={-1} key={row.imageId}>
                    <TableCell
                      align="center"
                      id={`No.${idx + 1 + props.rowsPerPage * props.page}`}
                    >
                      {idx + 1 + props.rowsPerPage * props.page}
                    </TableCell>
                    <TableCell
                      align="center"
                      id={`FruitType.${
                        idx + 1 + props.rowsPerPage * props.page
                      }`}
                    >
                      {row.fruitType}
                    </TableCell>
                    <TableCell
                      align="center"
                      id={`purchaseDate.${
                        idx + 1 + props.rowsPerPage * props.page
                      }`}
                    >
                      {dayjs(row.purchaseDate).format("YYYY-MM-DD")}
                    </TableCell>
                    <TableCell align="center">{row.expiryDate}</TableCell>
                    <TableCell align="center">{row.daysNotify}</TableCell>
                    <TableCell
                      align="center"
                      id={`Status.${idx + 1 + props.rowsPerPage * props.page}`}
                    >
                      {row.consumed
                        ? "Consumed"
                        : row.disposed
                        ? "Disposed"
                        : "N/A"}
                    </TableCell>
                    <TableCell align="center" id="date">
                      {row.consumed
                        ? row.consumedDate
                        : row.disposed
                        ? row.disposedDate
                        : ""}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        onClick={() => viewDetails(row)}
                        id={`View.${idx + 1 + props.rowsPerPage * props.page}`}
                      >
                        View
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleConsumeOpen(row)}
                        disabled={row.disposed}
                        id={`Consumed.${
                          idx + 1 + props.rowsPerPage * props.page
                        }`}
                      >
                        {row.consumed ? <>Un-consume</> : <>Consume</>}
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={row.consumed}
                        onClick={() => handleDisposeOpen(row)}
                        id={`Dispose.${
                          idx + 1 + props.rowsPerPage * props.page
                        }`}
                      >
                        {row.disposed ? <>Un-dispose</> : <>Dispose</>}
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleModalOpen(row)}
                        id={`updateNotif.${
                          idx + 1 + props.rowsPerPage * props.page
                        }`}
                      >
                        Update Notif
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => props.deleteProduct(row.imageId)}
                        id={`Delete.${
                          idx + 1 + props.rowsPerPage * props.page
                        }`}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={props.totalItem}
          rowsPerPage={props.rowsPerPage}
          page={props.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </Box>
  );
}
