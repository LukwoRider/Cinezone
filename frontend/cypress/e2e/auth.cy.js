// Test suite for user authentication flows (login and registration)
describe("Authentification", () => {
    beforeEach(() => {
        cy.visit("/login");
    });

    // Verify that all required login form elements are present
    it("affiche le formulaire de connexion", () => {
        cy.get("form").should("exist");
        cy.get("input[type='email']").should("exist");
        cy.get("input[type='password']").should("exist");
        cy.get("button[type='submit']").should("exist");
    });

    // Ensure HTML5 validation catches empty required fields
    it("affiche une erreur si les champs sont vides", () => {
        cy.get("button[type='submit']").click();
        cy.get("input[type='email']:invalid").should("exist");
    });

    // Verify that the API error message is displayed for wrong credentials
    it("affiche une erreur avec des identifiants incorrects", () => {
        cy.get("input[type='email']").type("wrong@email.com");
        cy.get("input[type='password']").type("wrongpassword");
        cy.get("button[type='submit']").click();

        cy.contains(/invalide|erreur|incorrect/i, { timeout: 5000 }).should("exist");
    });

    // Verify navigation link to the registration page exists
    it("contient un lien vers l'inscription", () => {
        cy.contains(/inscri|register|créer/i).should("exist");
    });
});

// Test suite for the registration page flow
describe("Page d'inscription", () => {
    beforeEach(() => {
        cy.visit("/register");
    });

    // Verify that all required registration form elements are present
    it("affiche le formulaire d'inscription", () => {
        cy.get("form").should("exist");
        cy.get("input[type='email']").should("exist");
        cy.get("input[type='password']").should("exist");
    });
});
