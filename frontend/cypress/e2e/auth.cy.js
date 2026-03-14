describe("Authentification", () => {
    beforeEach(() => {
        cy.visit("/login");
    });

    it("affiche le formulaire de connexion", () => {
        cy.get("form").should("exist");
        cy.get("input[type='email']").should("exist");
        cy.get("input[type='password']").should("exist");
        cy.get("button[type='submit']").should("exist");
    });

    it("affiche une erreur si les champs sont vides", () => {
        cy.get("button[type='submit']").click();
        // Le navigateur empêche la soumission grâce à 'required'
        cy.get("input[type='email']:invalid").should("exist");
    });

    it("affiche une erreur avec des identifiants incorrects", () => {
        cy.get("input[type='email']").type("wrong@email.com");
        cy.get("input[type='password']").type("wrongpassword");
        cy.get("button[type='submit']").click();

        // Attendre un message d'erreur (toast ou texte dans la page)
        cy.contains(/invalide|erreur|incorrect/i, { timeout: 5000 }).should("exist");
    });

    it("contient un lien vers l'inscription", () => {
        cy.contains(/inscri|register|créer/i).should("exist");
    });
});

describe("Page d'inscription", () => {
    beforeEach(() => {
        cy.visit("/register");
    });

    it("affiche le formulaire d'inscription", () => {
        cy.get("form").should("exist");
        cy.get("input[type='email']").should("exist");
        cy.get("input[type='password']").should("exist");
    });
});
