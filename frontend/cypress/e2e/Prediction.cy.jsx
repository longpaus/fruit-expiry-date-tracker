// register -> Prediction
import dayjs from "dayjs";

describe("<prediction testing />", () => {
  // Test to ensure that all fields are rendered correctly on the prediction page
  it("renders all fields", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("#email").type("8028@gmail.com");
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

    cy.url().should("include", "/prediction");
    cy.get("#imageUpload").should("exist");
    cy.get("#fruitType").should("be.visible");
    cy.get("#refridgerationForm").should("be.visible");
    cy.contains("label", "Purchase Date")
      .next()
      .find('button[aria-label="Choose date"]')
      .as("calendarButton")
      .should("be.visible");
    cy.get("#predictButton").should("be.visible");
  });

  // Test to check the standard operation flow after user registration
  it("Standard operation flow", () => {
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
    cy.get("#email").type("927@gmail.com");
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
    cy.get("#product-image")
      .should("exist")
      .and("have.attr", "alt")
      .and("eq", "apple.jpg");

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();
    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("10/10/2024");
    cy.wait(500);
    cy.get("#predictButton").should("not.be.disabled");
    cy.get("#predictButton").click();
    cy.get("#prediction-result").should("contain.text", "Estimated Expiry");
  });

  // Test for validating date selections, ensuring it is not a future date
  it("Test Date Selections", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("#email").type("933752926@gmail.com");
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

    cy.url().should("include", "/prediction");

    cy.get("#fruitType").type("apple");
    cy.get("#demo-simple-select-label").click();

    const element = cy
      .contains("label", "Purchase Date")
      .parent()
      .find("input");
    element.clear().type("12/10/2026");
    cy.wait(500);
    cy.get("#predictButton").should("be.disabled");
    cy.contains(
      "Please Input a valid consumption date that is not in the future!"
    );

    element.focus().clear();
    element.type("12/10/2023");
    cy.wait(500);
    cy.get("#predictButton").should("not.be.disabled");
    cy.get("#predictButton").click();
    cy.get("#prediction-result").should("contain.text", "Estimated Expiry");
  });
});
