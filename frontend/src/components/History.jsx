import React from "react";
import Typography from "@mui/material/Typography";

import HistoryTable from "./HistoryTable";
import { useNavigate } from "react-router-dom";

// A history page presents all prediction history and inventory of the authenticated user
const History = (props) => {
  const [order, setOrder] = React.useState("asc");
  const [history, setHistory] = React.useState([]);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [orderBy, setOrderBy] = React.useState("fruitType");
  const [updateData, setUpdateData] = React.useState(false);
  const [hideConsumed, setHideConsumed] = React.useState(false);
  const [hideDisposed, setHideDisposed] = React.useState(false);
  const [alertContent, setAlertContent] = React.useState([]);
  const [totalItem, setTotalItem] = React.useState(0);
  const [page, setPage] = React.useState(0);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      props.setToken(token);
    } else {
      navigate("/");
    }

    // Gets all prediction history and close-to-expire product info
    // of the authenticated user from the server
    async function getHistoryData() {
      let hideConsumedVariable = "unhide";
      hideConsumed
        ? (hideConsumedVariable = "hide")
        : (hideConsumedVariable = "unhide");
      let hideDisposedVariable = "unhide";
      hideDisposed
        ? (hideDisposedVariable = "hide")
        : (hideDisposedVariable = "unhide");
      const response = await fetch(
        `http://localhost:5005/history?consumed=${hideConsumedVariable}&disposed=${hideDisposedVariable}&page=${
          page + 1
        }&size=${rowsPerPage}&sort=${orderBy}&order=${order}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${props.token}`,
            "Content-type": "application/json",
          },
        }
      );
      const data = await response.json();
      setHistory(data[0]);
      setTotalItem(data[1]);
      //console.log(data);
      setUpdateData(false);
    }
    async function getAlertData() {
      const response = await fetch(`http://localhost:5005/history/alert`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      });
      const data = await response.json();
      setAlertContent(data);
    }
    getHistoryData();
    getAlertData();
  }, [
    order,
    orderBy,
    updateData,
    hideConsumed,
    hideDisposed,
    rowsPerPage,
    page,
  ]);

  console.log(alertContent);

  // Function to hide all the consumed products
  const controlHideConsumed = () => {
    setPage(0);
    hideConsumed ? setHideConsumed(false) : setHideConsumed(true);
  };

  // Function to hide all the disposed products
  const controlHideDisposed = () => {
    setPage(0);
    hideDisposed ? setHideDisposed(false) : setHideDisposed(true);
  };

  // Function to un-consume a product from the system
  const unconsumeProduct = async (imageId) => {
    const response = await fetch(
      `http://localhost:5005/history/unconsume?imageid=${imageId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response.status !== 200) {
      console.log("Error! Invalid Unconsumption!");
    }
    setUpdateData(true);
  };

  // Function to mark a product as consumed in the system
  const consumeProduct = async (imageId, days) => {
    const response = await fetch(
      `http://localhost:5005/history/consume?imageid=${imageId}&days=${days}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response.status !== 200) {
      console.log("Error! Invalid Consumption!");
    }
    setUpdateData(true);
  };

  // Function to un-dispose a product from the system
  const undisposeProduct = async (imageId) => {
    const response = await fetch(
      `http://localhost:5005/history/undispose?imageid=${imageId}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response.status !== 200) {
      console.log("Error! Invalid Undisposal!");
    }
    setUpdateData(true);
  };

  // Function to mark a product as consumed in the system
  const disposeProduct = async (imageId, days) => {
    const response = await fetch(
      `http://localhost:5005/history/dispose?imageid=${imageId}&days=${days}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response.status !== 200) {
      console.log("Error! Invalid Disposal!");
    }
    setUpdateData(true);
  };

  // Function to change the notification dates of a specific product in the system
  const changeNotifDate = async (imageId, days) => {
    const response = await fetch(
      `http://localhost:5005/history/notification?imageid=${imageId}&days=${days}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      }
    );
    if (response.status !== 200) {
      console.log("Error! Invalid Notification Date Change!");
    }
    setUpdateData(true);
  };

  // Function to remove a prediction history(inventory) from the system
  const deleteProduct = async (imageId) => {
    const response = await fetch(
      `http://localhost:5005/history/delete?imageid=${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${props.token}`,
          "Content-type": "application/json",
        },
      }
    );
    //console.log(response);
    if (response.status !== 200) {
      console.log("Error! Invalid Delete!");
    }
    setUpdateData(true);
  };

  return (
    <div
      className="historyPage"
      style={{
        paddingTop: "3rem",
        //border: "1px solid red",
        //display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "",
      }}
    >
      <Typography
        variant="caption"
        display="block"
        gutterBottom
        sx={{
          textAlign: "center",
        }}
        id="welcome-message"
      >
        <h1>Welcome! This is your freshness prediction history!</h1>
      </Typography>
      <div
        style={{
          //border: "10px solid red",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        id="history-table"
      >
        <HistoryTable
          historyData={history}
          order={order}
          orderBy={orderBy}
          setOrder={setOrder}
          setOrderBy={setOrderBy}
          deleteProduct={deleteProduct}
          setUpdateData={setUpdateData}
          consumeProduct={consumeProduct}
          unconsumeProduct={unconsumeProduct}
          disposeProduct={disposeProduct}
          undisposeProduct={undisposeProduct}
          controlHideConsumed={controlHideConsumed}
          controlHideDisposed={controlHideDisposed}
          changeNotifDate={changeNotifDate}
          rowsPerPage={rowsPerPage}
          setRowsPerPage={setRowsPerPage}
          alertContent={alertContent}
          totalItem={totalItem}
          page={page}
          setPage={setPage}
        />
      </div>
    </div>
  );
};

export default History;
