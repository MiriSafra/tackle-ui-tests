import {
    controls,
    stakeholdergroups,
    tdTag,
    trTag,
    button,
    createNewButton,
} from "../types/constants";
import { navMenu, navTab } from "../views/menu.view";
import {
    stakeholdergroupNameInput,
    stakeholdergroupDescriptionInput,
    stakeholdergroupMemberSelect,
} from "../views/stakeholdergroups.view";
import {
    confirmButton,
    editButton,
    deleteButton,
    flashMessage,
} from "../views/commoncontrols.view";
import {
    clickByText,
    inputText,
    click,
    selectItemsPerPage,
    submitForm,
    selectFormItems,
    checkFlashMessage,
} from "../../utils/utils";
import * as faker from "faker";

export class Stakeholdergroups {
    stakeholdergroupName;
    stakeholdergroupDescription;

    protected static clickStakeholdergroups(): void {
        clickByText(navMenu, controls);
        clickByText(navTab, stakeholdergroups);
    }

    protected fillName(name: string): void {
        inputText(stakeholdergroupNameInput, name);
    }

    protected fillDescription(description: string): void {
        inputText(stakeholdergroupDescriptionInput, description);
    }

    protected selectMember(member: string): void {
        selectFormItems(stakeholdergroupMemberSelect, member);
    }

    getStakeholdergroupName(): string {
        this.stakeholdergroupName = faker.company.companyName();
        return this.stakeholdergroupName;
    }

    getNewStakeholdergroupName(): string {
        return faker.company.companyName();
    }

    getStakeholdergroupDescription(): string {
        this.stakeholdergroupDescription = faker.lorem.sentence();
        return this.stakeholdergroupDescription;
    }

    create(member?: string): void {
        Stakeholdergroups.clickStakeholdergroups();
        clickByText(button, createNewButton);
        this.getStakeholdergroupName();
        this.getStakeholdergroupDescription();
        this.fillName(this.stakeholdergroupName);
        this.fillDescription(this.stakeholdergroupDescription);
        if (member) {
            this.selectMember(member);
        }
        submitForm();
        checkFlashMessage(
            flashMessage,
            `Success! ${this.stakeholdergroupName} was added as a stakeholder group.`
        );
    }

    edit(name?: string, description?: string, member?: string): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        cy.get(tdTag)
            .contains(this.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(editButton);
            });

        this.stakeholdergroupName = name || this.stakeholdergroupName;
        if (name) {
            this.fillName(name);
        }

        this.stakeholdergroupDescription = description || this.stakeholdergroupDescription;

        if (description) {
            this.fillDescription(this.stakeholdergroupDescription);
        }
        if (member) {
            this.selectMember(member);
        }

        submitForm();
    }

    delete(name?: string): void {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.stakeholdergroupName = name || this.stakeholdergroupName;
        cy.get(tdTag)
            .contains(this.stakeholdergroupName)
            .parent(trTag)
            .within(() => {
                click(deleteButton);
            });
        click(confirmButton);
    }

    exists(name?: string) {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.stakeholdergroupName = name || this.stakeholdergroupName;
        cy.get(tdTag).should("contain", this.stakeholdergroupName);
    }

    notExists(name?: string) {
        Stakeholdergroups.clickStakeholdergroups();
        selectItemsPerPage(100);
        cy.wait(2000);
        this.stakeholdergroupName = name || this.stakeholdergroupName;
        cy.get(tdTag).should("not.contain", this.stakeholdergroupName);
    }
}
