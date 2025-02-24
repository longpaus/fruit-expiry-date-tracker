describe("<profile testing />", () => {
  // Test to verify that all profile fields are visible after a successful registration
  it("renders all fields", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("#email").type("78777024@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.contains("The Password does not match! Please double check!").should(
      "not.exist"
    );
    cy.get("#submitButton").click();
    cy.url().should("include", "/profile");

    cy.get("#AvatarBotton").should("be.visible");
    cy.get("#email").should("be.visible");
    cy.get("#OldPassword").scrollIntoView().should("be.visible");
    cy.get("#New_Password").should("be.visible");
    cy.get("#New_Password_Confirmation").should("be.visible");
    cy.get("#notificationTime").should("be.visible");
    cy.get("#SubmitBotton").should("be.visible");
    cy.get("#CancelBotton").should("be.visible");
  });

  // Test for incorrect old password scenario while updating the profile
  it("profile test old password incorrect", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type("78777024@gmail.com");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#login").click();
    cy.url().should("include", "/history");
    cy.get("#Profile").click();

    cy.get("#OldPassword").scrollIntoView().type("2");
    cy.get("#New_Password").type("3");
    cy.get("#New_Password_Confirmation").type("3");
    cy.get("#SubmitBotton").click();
    cy.contains("Passwords do not match").should("be.visible");
  });

  // Test for password mismatch in the new password and confirmation fields
  it("profile test new password not match incorrect", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type("78777024@gmail.com");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#login").click();
    cy.url().should("include", "/history");
    cy.get("#Profile").click();

    cy.get("#OldPassword").scrollIntoView().type("8888");
    cy.get("#New_Password").type("3");
    cy.get("#New_Password_Confirmation").type("4");
    cy.get("#SubmitBotton").click();
    cy.contains("new password does not match").should("be.visible");
  });

  // Test for successful password change
  it("profile test password change success", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type("78777024@gmail.com");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#login").click();
    cy.url().should("include", "/history");
    cy.get("#Profile").click();

    cy.get("#OldPassword").scrollIntoView().type("8888");
    cy.get("#New_Password").type("9999");
    cy.get("#New_Password_Confirmation").type("9999");
    cy.get("#SubmitBotton").click();
    cy.url().should("include", "/history");
  });

  // Test for successful notification time update
  it("profile test notification success", () => {
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type("78777024@gmail.com");
    cy.get("#outlined-adornment-password").type("9999");
    cy.get("#login").click();
    cy.url().should("include", "/history");
    cy.get("#Profile").click();

    cy.get("#OldPassword").scrollIntoView().type("9999");
    cy.get("#New_Password").type("8888");
    cy.get("#New_Password_Confirmation").type("8888");
    cy.get("#notificationTime").type("7");
    cy.get("#SubmitBotton").click();
    cy.url().should("include", "/history");
  });

  // Test to ensure the user's profile picture is displayed correctly
  it("should display the user profile picture", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("#email").type("78777034@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.contains("The Password does not match! Please double check!").should(
      "not.exist"
    );
    cy.get("#submitButton").click();
    cy.url().should("include", "/profile");

    cy.get(".MuiAvatar-img").as("profilePicture");
    cy.get("@profilePicture")
      .should("be.visible")
      .and("have.prop", "naturalWidth")
      .and("be.greaterThan", 0);
    cy.get("@profilePicture")
      .should("have.attr", "src")
      .and("include", "blob:http://localhost:3000/");
  });

  // Test to ensure the user can upload a file and the profile picture gets updated
  it("uploads a file", () => {
    // Visit the file upload page
    cy.visit("http://localhost:3000/login");
    cy.get("#email").type("78777034@gmail.com");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#login").click();
    cy.url().should("include", "/history");
    cy.get("#Profile").click();

    // Get the file input element and attach a file
    const fileName = "banana.jpg";
    cy.get(".MuiButton-contained").click();
    cy.get("input[type='file']").attachFile(fileName);
    cy.get(".MuiAvatar-img")
      .should("exist")
      .and("have.attr", "name")
      .and("eq", "banana.jpg");
  });
});
