import Register from '../../src/components/Register'
import React from 'react'

describe('<Register />', () => {
  // Runs before each test to navigate to the correct page and set up the test environment
  beforeEach(() => {
    cy.visit('http://localhost:3000')

    cy.get('#Register').click()
    cy.url().should('include', '/register')
  })

  // Test to ensure all form fields are rendered correctly
  it('renders all fields', () => {
    cy.get('#email').should('be.visible')
    cy.get('#userName').should('be.visible')
    cy.get('#outlined-adornment-password').should('be.visible')
    cy.get('#outlined-adornment-password-confirmation').should('be.visible')
  })

  // Test to check the behavior when password and confirmation password do not match
  it('different password setting check', () => {
    cy.get('#outlined-adornment-password').type('123')
    cy.get('#outlined-adornment-password-confirmation').type('345')
    cy.contains('The Password does not match! Please double check!').should(
      'be.visible'
    )
    cy.get('#submitButton').should('be.disabled')
  })
  // Test for successfully entering valid registration information
  it('try to enter valid information', () => {
    cy.get('#email').type('z56@gmail.com')
    cy.get('#userName').type('Oswald')
    cy.get('#outlined-adornment-password').type('123')
    cy.get('#outlined-adornment-password-confirmation').type('123')
    cy.contains('The Password does not match! Please double check!').should(
      'not.exist'
    )

    cy.get('#submitButton').click()
  })
  
  // Test to check the scenario when the email is already registered
  it('email already exist', () => {
    cy.get('#email').type('z56@gmail.com')
    cy.get('#userName').type('Oswald')
    cy.get('#outlined-adornment-password').type('123')
    cy.get('#outlined-adornment-password-confirmation').type('123')
    cy.contains('The Password does not match! Please double check!').should(
      'not.exist'
    )

    cy.get('#submitButton').click()
    cy.contains('Email is already registered').should('be.visible')
  })
})
