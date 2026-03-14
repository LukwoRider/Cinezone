// Test suite for the home page (movie catalog)
describe("Page d'accueil", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    // Ensure core layout components are present
    it("affiche le header et le footer", () => {
        cy.get("header").should("exist");
        cy.get("footer").should("exist");
    });

    // Verify the grid displays at least one movie card initially
    it("affiche la grille de films", () => {
        cy.get(".movies-grid").should("exist");
        cy.get(".movie-card").should("have.length.greaterThan", 0);
    });

    // Verify filter inputs (search, category, rating, etc.) are rendered
    it("affiche les filtres", () => {
        cy.get(".filters").should("exist");
        cy.get(".filters input[type='text']").should("exist");
        cy.get(".filters select").should("have.length.greaterThan", 0);
    });

    // Test behavior when searching for a non-existent movie
    it("filtre les films par recherche", () => {
        cy.get(".filters input[type='text']").type("zzzznonexistent");
        cy.get(".movie-card").should("have.length", 0);
    });

    // Ensure clearing the search input brings back the full catalog
    it("réinitialise les résultats en vidant la recherche", () => {
        cy.get(".filters input[type='text']").type("zzzznonexistent");
        cy.get(".movie-card").should("have.length", 0);

        cy.get(".filters input[type='text']").clear();
        cy.get(".movie-card").should("have.length.greaterThan", 0);
    });
});
