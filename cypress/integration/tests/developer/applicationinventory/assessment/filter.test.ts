/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    login,
    clickByText,
    exists,
    preservecookies,
    applySearchFilter,
    hasToBeSkipped,
    createMultipleBusinessServices,
    createMultipleTags,
    deleteAllBusinessServices,
    deleteApplicationTableRows,
    selectUserPerspective,
    createMultipleApplicationsWithBSandTags,
    applySelectFilter,
    deleteAllTagsAndTagTypes,
    getRandomApplicationData,
    getRandomAnalysisData,
    notExists,
} from "../../../../../utils/utils";
import { navMenu, navTab } from "../../../../views/menu.view";
import {
    applicationInventory,
    button,
    name,
    clearAllFilters,
    description,
    businessService,
    tag,
    assessment,
    CredentialType,
    UserCredentials,
    credentialType,
    artifact,
} from "../../../../types/constants";

import * as data from "../../../../../utils/data_utils";
import { Application } from "../../../../models/developer/applicationinventory/application";
import { CredentialsSourceControlUsername } from "../../../../models/administrator/credentials/credentialsSourceControlUsername";
import { CredentialsMaven } from "../../../../models/administrator/credentials/credentialsMaven";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";

var applicationsList: Array<Application> = [];
var invalidSearchInput = String(data.getRandomNumber());
let source_credential;
let maven_credential;

describe("Application inventory filter validations", { tags: "@tier2" }, function () {
    before("Login and Create Test Data", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier2")) return;

        // Perform login
        login();

        //Create Multiple Application with Business service and Tags
        let businessservicesList = createMultipleBusinessServices(2);
        let tagList = createMultipleTags(2);
        applicationsList = createMultipleApplicationsWithBSandTags(
            2,
            businessservicesList,
            tagList
        );

        // Create source Credentials
        source_credential = new CredentialsSourceControlUsername(
            data.getRandomCredentialsData(
                CredentialType.sourceControl,
                UserCredentials.usernamePassword,
                true
            )
        );
        source_credential.create();

        // Create Maven credentials
        maven_credential = new CredentialsMaven(
            data.getRandomCredentialsData(CredentialType.maven, "None", true)
        );
        maven_credential.create();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        if (hasToBeSkipped("@tier2")) return;

        deleteAllTagsAndTagTypes();
        deleteAllBusinessServices();
        deleteApplicationTableRows();
    });

    it("Name filter validations", function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);

        // Enter an existing name substring and assert
        var validSearchInput = applicationsList[0].name.substring(0, 11);
        applySearchFilter(name, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].name);

        if (applicationsList[1].name.indexOf(validSearchInput) >= 0) {
            exists(applicationsList[1].name);
        }
        clickByText(button, clearAllFilters);

        // Enter an exact existing name and assert
        applySearchFilter(name, applicationsList[1].name);
        cy.wait(2000);
        exists(applicationsList[1].name);

        clickByText(button, clearAllFilters);

        // Enter a non-existing name substring and apply it as search filter
        applySearchFilter(name, invalidSearchInput);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No applications available");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Descriptions filter validations", function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);

        // Enter an existing description substring and assert
        var validSearchInput = applicationsList[0].description.substring(0, 8);
        applySearchFilter(description, validSearchInput);
        cy.wait(2000);
        exists(applicationsList[0].description);

        if (applicationsList[1].description.indexOf(validSearchInput) >= 0) {
            exists(applicationsList[1].description);
        }
        clickByText(button, clearAllFilters);

        // Enter an exact existing description substring and assert
        applySearchFilter(description, applicationsList[1].description);
        cy.wait(2000);
        exists(applicationsList[1].description);

        clickByText(button, clearAllFilters);

        // Enter a non-existing description substring and apply it as search filter
        applySearchFilter(description, invalidSearchInput);
        cy.wait(3000);

        // Assert that no search results are found
        cy.get("h2").contains("No applications available");

        // Clear all filters
        clickByText(button, clearAllFilters);
    });

    it("Business service filter validations", function () {
        // This is impacted by https://issues.redhat.com/browse/TACKLE-820
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);

        // Enter an existing businessservice and assert
        var validSearchInput = applicationsList[0].business;
        applySearchFilter(businessService, validSearchInput);
        cy.wait(2000);

        exists(applicationsList[0].business);

        clickByText(button, clearAllFilters);
    });

    it("Tag filter validations", function () {
        selectUserPerspective("Developer");
        clickByText(navMenu, applicationInventory);
        clickByText(navTab, assessment);

        // Enter an existing tag and assert
        var validSearchInput = applicationsList[0].tags[0];
        applySearchFilter(tag, validSearchInput);
        cy.wait(2000);

        exists(applicationsList[0].tags[0]);

        clickByText(button, clearAllFilters);

        // Enter a non-existing tag and apply it as search filter
        applySelectFilter("tags", tag, data.getRandomWord(5), false);
    });

    it("Credential type filter validations", function () {
        // For application must have source code URL git or svn and group,artifcat and version
        const application1 = new Analysis(
            getRandomApplicationData("tackleTestApp_Source", {
                sourceData: this.appData[1],
                binaryData: this.appData[2],
            }),
            getRandomAnalysisData(this.analysisData[3])
        );
        application1.create();
        cy.wait("@getApplication");
        cy.wait(2000);

        // Attach Maven credential
        application1.manageCredentials("None", maven_credential.name);
        exists(application1.name);

        // Enter Maven and assert
        applySearchFilter(credentialType, "Maven");
        cy.wait(2000);
        exists(application1.name);
        clickByText(button, clearAllFilters);

        // Change the credentials to Source and test
        application1.manageCredentials(source_credential.name, "None");
        exists(application1.name);

        // Enter Source and assert
        applySearchFilter(credentialType, "Source");
        cy.wait(2000);
        exists(application1.name);
        clickByText(button, clearAllFilters);
    });

    it("Artifact type filter validations", function () {
        // For application must have Binary group,artifact and version
        const application = new Application(
            getRandomApplicationData("tackleTestApp_Source", {
                binaryData: this.appData[2],
            })
        );
        application.create();
        cy.get("@getApplication");
        cy.wait(2000);

        // Check application exists on the page
        exists(application.name);

        // Apply artifact filter check with associated artifact field
        applySearchFilter(artifact, "Associated artifact");
        cy.wait(2000);
        exists(application.name);
        clickByText(button, clearAllFilters);

        // Apply artifact filter check with not associated artifact field
        applySearchFilter(artifact, "Not associated artifact");
        cy.wait(2000);
        exists(applicationsList[0].name);
        notExists(application.name);
        clickByText(button, clearAllFilters);
    });
});
