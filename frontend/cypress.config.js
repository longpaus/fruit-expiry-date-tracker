const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    browserPermissions: {
      notifications: "allow",
      geolocation: "allow",
      camera: "block",
      microphone: "block",
      images: "allow",
      javascript: "allow",
      popups: "ask",
      plugins: "ask",
      cookies: "allow",
    },
  },

  component: {
    devServer: {
      framework: "create-react-app",
      bundler: "webpack",
    },
  },

  env: {
    browserPermissions: {
      notifications: "allow",
      geolocation: "allow",
      camera: "block",
      microphone: "block",
      images: "allow",
      javascript: "allow",
      popups: "ask",
      plugins: "ask",
      cookies: "allow",
    },
  },
});
