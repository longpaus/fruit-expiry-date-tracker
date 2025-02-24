// register -> Prediction
import dayjs from "dayjs";

describe("<history testing />", () => {
  // Test if all critical fields in the history page renders
  it("Renders all fields", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("#email").type("997@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.contains("The Password does not match! Please double check!").should(
      "not.exist"
    );
    cy.get("#submitButton").click();
    cy.url().should("include", "/profile");
    cy.get("#CancelBotton").click();
    cy.get("#History").click();
    cy.get("#welcome-message").should("exist");
    cy.get("#history-table").should("exist");
    cy.get("#history-table-body").should("exist");
    cy.get("#hide-consumed-button").should("exist");
    cy.get("#hide-disposed-button").should("exist");
    cy.get("#history-table-head").should("exist");
    cy.get("#fruitType").should("exist");
    cy.get("#purchaseDate").should("exist");
    cy.get("#expiryDate").should("exist");
    cy.get("#daysNotify").should("exist");
  });

  // Test if the prediction history correctly loads in the history page
  it("Shows the prediction history", () => {
    cy.visit("http://localhost:3000/register", {
      onBeforeLoad({ navigator }) {
        // Sydney, AU
        const latitude = -33.865143;
        const longitude = 151.2099;
        cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
          coords: { latitude, longitude },
        });
      },
    });
    cy.get("#email").type("998@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.contains("The Password does not match! Please double check!").should(
      "not.exist"
    );
    cy.get("#submitButton").click();
    cy.url().should("include", "/profile");
    cy.get("#CancelBotton").click();
    cy.get("#Prediction").click();

    const fileName = "apple.jpg";
    cy.get(".MuiButton-contained").click();
    cy.get("input[type='file']").attachFile(fileName);

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();
    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("10/10/2024");
    cy.wait(1000);
    cy.get("#predictButton").click();
    cy.wait(10000);
    cy.get("#History").click();
    cy.wait(1000);
    cy.get("#fruitType").should("exist");
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(0).should("contain.text", "1"); // Asserts that the first cell
        cy.get("td").eq(1).should("contain.text", "apple");
        cy.get("td").eq(2).should("contain.text", "2024-10-10");
        cy.get("td").eq(4).should("contain.text", "3");
        cy.get("td").eq(5).should("contain.text", "N/A");
        cy.get("td").eq(7).contains("View");
        cy.get("td").eq(7).contains("Consume");
        cy.get("td").eq(7).contains("Dispose");
        cy.get("td").eq(7).contains("Update Notif");
        cy.get("td").eq(7).contains("Delete");
      });
  });

  // Test if the notification date button works as expected and if the alert button
  // would appear when a product is about to expire
  it("Change Notification Date / Alert Button", () => {
    cy.visit("http://localhost:3000/register", {
      onBeforeLoad({ navigator }) {
        // Sydney, AU
        const latitude = -33.865143;
        const longitude = 151.2099;
        cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
          coords: { latitude, longitude },
        });
      },
    });
    cy.get("#email").type("996@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.get("#submitButton").click();
    cy.get("#CancelBotton").click();
    cy.get("#Prediction").click();

    const fileName = "apple.jpg";
    cy.get(".MuiButton-contained").click();
    cy.get("input[type='file']").attachFile(fileName);

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();
    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("10/10/2024");
    cy.wait(1000);
    cy.get("#predictButton").click();
    cy.wait(10000);
    cy.get("#History").click();
    cy.get("#fruitType").should("exist");
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(7).contains("Update Notif").click();
      });
    cy.get("#notification-dates").type(10);
    cy.get("#submit-update-notif").click();
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(4).should("contain.text", "10");
      });
    cy.get("#alert-page").should("be.visible");
  });

  // Test if the a product has been successfully removed from the system
  // when the delete button has been clicked
  it("Delete history", () => {
    cy.visit("http://localhost:3000/register", {
      onBeforeLoad({ navigator }) {
        // Sydney, AU
        const latitude = -33.865143;
        const longitude = 151.2099;
        cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
          coords: { latitude, longitude },
        });
      },
    });
    cy.get("#email").type("999@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.get("#submitButton").click();
    cy.get("#CancelBotton").click();
    cy.get("#Prediction").click();

    const fileName = "apple.jpg";
    cy.get(".MuiButton-contained").click();
    cy.get("input[type='file']").attachFile(fileName);

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();
    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("10/10/2024");
    cy.wait(1000);
    cy.get("#predictButton").click();
    cy.wait(10000);
    cy.get("#History").click();
    cy.get("#fruitType").should("exist");
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(7).contains("Delete").click();
      });
    cy.get("#history-table-content").find("tr").should("have.length", 0);
  });

  // Test if a product has successfully been consumed and if the hide consumed
  // button works as expected
  it("Consume/Unconsume/Hide Consumed", () => {
    cy.visit("http://localhost:3000/register", {
      onBeforeLoad({ navigator }) {
        // Sydney, AU
        const latitude = -33.865143;
        const longitude = 151.2099;
        cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
          coords: { latitude, longitude },
        });
      },
    });
    cy.get("#email").type("982@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.get("#submitButton").click();
    cy.get("#CancelBotton").click();
    cy.get("#Prediction").click();

    const fileName = "apple.jpg";
    cy.get(".MuiButton-contained").click();
    cy.get("input[type='file']").attachFile(fileName);

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();
    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("10/10/2024");
    cy.wait(1000);
    cy.get("#predictButton").click();
    cy.wait(10000);
    cy.get("#History").click();
    cy.get("#fruitType").should("exist");
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(7).contains("Consume").click();
      });

    cy.get("#cancel-consume").click();
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(5).should("contain.text", "N/A");
        cy.get("td").eq(7).contains("Consume").click();
      });
    cy.get("#submit-consume").click();
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(5).should("contain.text", "Consumed");
      });
    cy.get("#hide-consumed-button").click();
    cy.get("#history-table-content").find("tr").should("have.length", 0);
  });

  // Test if a product has successfully been disposed and if the hide disposed
  // button works as expected
  it("Dispose/Undispose/Hide Disposed", () => {
    cy.visit("http://localhost:3000/register", {
      onBeforeLoad({ navigator }) {
        // Sydney, AU
        const latitude = -33.865143;
        const longitude = 151.2099;
        cy.stub(navigator.geolocation, "getCurrentPosition").callsArgWith(0, {
          coords: { latitude, longitude },
        });
      },
    });
    cy.get("#email").type("986@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.get("#submitButton").click();
    cy.get("#CancelBotton").click();
    cy.get("#Prediction").click();

    const fileName = "apple.jpg";
    cy.get(".MuiButton-contained").click();
    cy.get("input[type='file']").attachFile(fileName);

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();
    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("10/10/2024");
    cy.wait(1000);
    cy.get("#predictButton").click();
    cy.wait(10000);
    cy.get("#History").click();
    cy.get("#fruitType").should("exist");
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(7).contains("Dispose").click();
      });
    cy.get("#cancel-dispose").click();
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(5).should("contain.text", "N/A");
        cy.get("td").eq(7).contains("Dispose").click();
      });
    cy.get("#submit-dispose").click();
    cy.get("#history-table-content") // Selects the table
      .find("tr") // Finds rows inside the table body
      .eq(0) // Chooses the first row
      .within(() => {
        cy.get("td").eq(5).should("contain.text", "Disposed");
      });
    cy.get("#hide-disposed-button").click();
    cy.get("#history-table-content").find("tr").should("have.length", 0);
  });
});
