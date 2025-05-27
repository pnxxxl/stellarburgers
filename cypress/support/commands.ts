/// <reference types="cypress" />

import { title } from "process";

Cypress.Commands.add('addIngredient', (type) => {
  cy.get(`[data-cy="${type}"]`).children().first().children('button').click();
});
