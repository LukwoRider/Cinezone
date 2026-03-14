describe("Page des catégories", () => {
    beforeEach(() => {
        cy.visit("/categories");
    });

    it("affiche le titre de la page", () => {
        cy.contains(/catégorie/i).should("exist");
    });

    it("affiche la liste des catégories", () => {
        cy.get(".categories-list").should("exist");
        cy.get(".category-item").should("have.length.greaterThan", 0);
    });

    it("affiche les boutons modifier et supprimer pour chaque catégorie", () => {
        cy.get(".category-item").first().within(() => {
            cy.contains(/modifier/i).should("exist");
            cy.contains(/supprimer/i).should("exist");
        });
    });

    it("ouvre la modale d'ajout de catégorie", () => {
        cy.contains(/ajouter/i).click();
        cy.get(".modal-overlay").should("exist");
        cy.get("input[placeholder*='catégorie']").should("exist");
    });
});
