import { teardown } from '../support/authentication';
import * as menu from '../support/menu';
import * as datasetImportPage from '../support/datasetImportPage';
import * as searchDrawer from '../support/searchDrawer';
import * as adminNavigation from '../support/adminNavigation';

describe('Dataset Publication', () => {
    beforeEach(teardown);

    describe('Dataset Import', () => {
        it('should get the list of possible loaders', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            cy.wait(300);

            datasetImportPage.checkListOfSupportedFileFormats();
            datasetImportPage.checkListOfFiltererFileFormats();
        });

        it('should receive a csv file and preview its data in a table', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            cy.wait(300);
            datasetImportPage.importDataset('dataset/simple.csv');
            cy.wait(500);
            cy.get('tbody tr')
                .eq(0)
                .should('contains.text', ['1', 'Row 1', 'Test 1'].join(''));

            cy.get('tbody tr')
                .eq(1)
                .should('contains.text', ['2', 'Row 2', 'Test 2'].join(''));
        });
    });

    describe('Publication', () => {
        it('should publish dataset by manually adding columns', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            datasetImportPage.importDataset('dataset/simple.csv');
            adminNavigation.goToDisplay();

            cy.get('.sidebar')
                .contains('a', 'Resource pages')
                .click();

            datasetImportPage.addColumn('Column 1');

            cy.get('.publication-excerpt')
                .contains('Row 1')
                .should('be.visible');
            cy.get('.publication-excerpt')
                .contains('Row 2')
                .should('be.visible');

            datasetImportPage.publish();
            datasetImportPage.goToPublishedResources();
        });

        it('should publish dataset by importing an existing model', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            datasetImportPage.importDataset('dataset/simple.csv');
            datasetImportPage.importModel('model/concat.json');

            cy.get('.sidebar')
                .contains('a', 'Resource pages')
                .click();

            cy.contains('["Row 1","Test 1"]').should('be.visible');
            cy.contains('["Row 2","Test 2"]').should('be.visible');

            datasetImportPage.publish();
            datasetImportPage.goToPublishedResources();
            menu.openSearchDrawer();

            cy.get('.search-result-title')
                .contains('Row 1')
                .should('be.visible');
            cy.get('.search-result-title')
                .contains('Row 2')
                .should('be.visible');
        });

        it('should allow to fix obsolete imported model before publish dataset', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            datasetImportPage.importDataset('dataset/simple.csv');
            datasetImportPage.importModel('model/concat-obsolete.json');

            cy.contains('Errors').click();
            cy.contains('Operation UNKNOWN-OPERATION does not exist').click();

            datasetImportPage.setOperationTypeInWizard('BOOLEAN');
            datasetImportPage.publish();
        });

        it('should allow to load a file multiple times', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            datasetImportPage.importDataset('dataset/simple.csv');
            datasetImportPage.importModel('model/concat.json');
            datasetImportPage.publish();
            cy.wait(300);
            datasetImportPage.importMoreDataset('dataset/simplewithouturi.csv');
            datasetImportPage.importMoreDataset('dataset/simplewithouturi.csv');
            datasetImportPage.importMoreDataset('dataset/simplewithouturi.csv');
            datasetImportPage.importMoreDataset('dataset/simplewithouturi.csv');
            datasetImportPage.importMoreDataset('dataset/simplewithouturi.csv');
            datasetImportPage.importMoreDataset('dataset/simplewithouturi.csv');

            datasetImportPage.goToPublishedResources();

            menu.openSearchDrawer();
            searchDrawer.checkMoreResultsCount(10, 14);
        });
    });

    describe('Facets', () => {
        it('should allow to have a facet with a single value', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            datasetImportPage.importDataset('dataset/single-facet.csv');
            datasetImportPage.importModel('model/facet.json');
            datasetImportPage.publish();

            datasetImportPage.goToPublishedResources();
            menu.openSearchDrawer();

            cy.contains('Affiliation(s)').click();
            cy.get('.search-facets')
                .find('.facet-item')
                .should('have.length', 1);

            cy.get('.search-facets')
                .find('.facet-value-item')
                .should('have.length', 1);
        });

        it('should allow to have facets with multiples values in them', () => {
            menu.openAdvancedDrawer();
            menu.goToAdminDashboard();
            datasetImportPage.importDataset('dataset/multiple-facet.csv');
            datasetImportPage.importModel('model/facet.json');
            datasetImportPage.publish();

            datasetImportPage.goToPublishedResources();
            menu.openSearchDrawer();

            cy.contains('Affiliation(s)').click();
            cy.get('.search-facets')
                .find('.facet-item')
                .should('have.length', 1);

            cy.get('.search-facets')
                .find('.facet-value-item')
                .should('have.length', 3);
        });
    });
});
