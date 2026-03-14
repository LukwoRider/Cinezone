// Test suite for application-wide routing and navigation links
describe("Navigation générale", () => {
    // Ensure clicking a movie card navigates to its details page
    it("navigue de l'accueil vers un film", () => {
        cy.visit("/");
        cy.get(".movie-card").first().click();
        cy.url().should("include", "/movies/");
        cy.get(".movie-details").should("exist");
    });

    // Ensure the "back" link on the details page returns home
    it("retourne à l'accueil depuis un film", () => {
        cy.visit("/");
        cy.get(".movie-card").first().click();
        cy.url().should("include", "/movies/");

        cy.get(".back-link").click();
        cy.url().should("eq", Cypress.config().baseUrl + "/");
    });

    // Verify manual navigation to the login route works
    it("navigue vers la page de connexion", () => {
        cy.visit("/login");
        cy.get("form").should("exist");
        cy.url().should("include", "/login");
    });

    // Verify manual navigation to the register route works
    it("navigue vers la page d'inscription", () => {
        cy.visit("/register");
        cy.get("form").should("exist");
        cy.url().should("include", "/register");
    });

    // Make sure a nonexistent URL does not crash the app entirely
    it("affiche une page 404 pour une route inconnue", () => {
        cy.visit("/quelquechose-qui-nexiste-pas", { failOnStatusCode: false });
        cy.get(".app").should("exist");
    });
});
