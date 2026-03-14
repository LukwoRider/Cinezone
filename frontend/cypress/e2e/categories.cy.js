// Test suite for the categories management page (admin feature)
describe("Page des catégories", () => {
    beforeEach(() => {
        cy.visit("/categories");
    });

    // Verify that the page title is displayed correctly
    it("affiche le titre de la page", () => {
        cy.contains(/catégorie/i).should("exist");
    });

    // Ensure a populated list of categories is rendered
    it("affiche la liste des catégories", () => {
        cy.get(".categories-list").should("exist");
        cy.get(".category-item").should("have.length.greaterThan", 0);
    });

    // Verify action buttons exist for each listed category
    it("affiche les boutons modifier et supprimer pour chaque catégorie", () => {
        cy.get(".category-item").first().within(() => {
            cy.contains(/modifier/i).should("exist");
            cy.contains(/supprimer/i).should("exist");
        });
    });

    // Ensure the "add category" modal opens successfully and contains the input form
    it("ouvre la modale d'ajout de catégorie", () => {
        cy.contains(/ajouter/i).click();
        cy.get(".modal-overlay").should("exist");
        cy.get("input[placeholder*='catégorie']").should("exist");
    });
});
