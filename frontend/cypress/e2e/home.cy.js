describe("Page d'accueil", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("affiche le header et le footer", () => {
        cy.get("header").should("exist");
        cy.get("footer").should("exist");
    });

    it("affiche la grille de films", () => {
        cy.get(".movies-grid").should("exist");
        cy.get(".movie-card").should("have.length.greaterThan", 0);
    });

    it("affiche les filtres", () => {
        cy.get(".filters").should("exist");
        cy.get(".filters input[type='text']").should("exist");
        cy.get(".filters select").should("have.length.greaterThan", 0);
    });

    it("filtre les films par recherche", () => {
        cy.get(".filters input[type='text']").type("zzzznonexistent");
        cy.get(".movie-card").should("have.length", 0);
    });

    it("réinitialise les résultats en vidant la recherche", () => {
        cy.get(".filters input[type='text']").type("zzzznonexistent");
        cy.get(".movie-card").should("have.length", 0);

        cy.get(".filters input[type='text']").clear();
        cy.get(".movie-card").should("have.length.greaterThan", 0);
    });
});
