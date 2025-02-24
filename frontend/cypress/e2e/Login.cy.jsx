describe("<Login />", () => {
  // Before each test, visit the homepage and click the login button
  beforeEach(() => {
    cy.visit("http://localhost:3000");

    cy.get("#Login").click();
    cy.url().should("include", "/login");
  });
  // Test case: Ensure all necessary fields are visible on the login page
  it("renders all fields", () => {
    cy.get("#email").should("be.visible");
    cy.get("#outlined-adornment-password").should("be.visible");
    cy.get("#login").should("be.visible");
    cy.get("#cancelButton").should("be.visible");
  });

  // Test case: Attempt to login with a wrong email and password combination
  it("wrong email", () => {
    // cy.visit('http://localhost:3000/login')
    cy.get("#email").type("wrong@email.com");
    cy.get("#outlined-adornment-password").type("wrongPassword");

    cy.get("#login").click();

    cy.contains("email not exist or password not correct").should("be.visible");
  });

  // Test case: Attempt to login with a correct email but a wrong password
  it("wrong password", () => {
    // cy.visit('http://localhost:3000/login')
    cy.get("#email").type("z56@email.com");
    cy.get("#outlined-adornment-password").type("wrongPassword");

    cy.get("#login").click();

    cy.contains("email not exist or password not correct").should("be.visible");
  });

  // Test case: testing success login
  it("successful logins", () => {
    cy.visit("http://localhost:3000/register");
    cy.get("#email").type("zqq2@gmail.com");
    cy.get("#userName").type("Oswald");
    cy.get("#outlined-adornment-password").type("8888");
    cy.get("#outlined-adornment-password-confirmation").type("8888");
    cy.contains("The Password does not match! Please double check!").should(
      "not.exist"
    );
    cy.get("#submitButton").click();
    cy.url().should("include", "/profile");
    cy.get("#Logout").click();

    cy.visit("http://localhost:3000/login");
    cy.get("#email").type("zqq2@gmail.com");
    cy.get("#outlined-adornment-password").type("8888");

    cy.intercept("POST", "/login").as("loginRequest");
    cy.get("#login").click();
    cy.wait("@loginRequest");
    cy.wait(5000);
    cy.window().then((content) => {
      const token = content.localStorage.getItem("token");
      expect(token).to.exist;
    });
    cy.url().should("include", "/history");
  });

  // Test case: Cancel the login process and ensure user is redirected to the landing page
  it("successful cancel login", () => {
    cy.get("#cancelButton").click();
    cy.url().should("include", "/landpage");
  });
});
