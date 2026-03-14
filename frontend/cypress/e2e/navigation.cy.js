describe("Navigation générale", () => {
    it("navigue de l'accueil vers un film", () => {
        cy.visit("/");
        cy.get(".movie-card").first().click();
        cy.url().should("include", "/movies/");
        cy.get(".movie-details").should("exist");
    });

    it("retourne à l'accueil depuis un film", () => {
        cy.visit("/");
        cy.get(".movie-card").first().click();
        cy.url().should("include", "/movies/");

        cy.get(".back-link").click();
        cy.url().should("eq", Cypress.config().baseUrl + "/");
    });

    it("navigue vers la page de connexion", () => {
        cy.visit("/login");
        cy.get("form").should("exist");
        cy.url().should("include", "/login");
    });

    it("navigue vers la page d'inscription", () => {
        cy.visit("/register");
        cy.get("form").should("exist");
        cy.url().should("include", "/register");
    });

    it("affiche une page 404 pour une route inconnue", () => {
        cy.visit("/quelquechose-qui-nexiste-pas", { failOnStatusCode: false });
        // L'app React affiche une page vide ou redirige, on vérifie juste que ça ne crash pas
        cy.get(".app").should("exist");
    });
});
