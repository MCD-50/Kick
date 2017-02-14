
export class Action {
    constructor(actionName, actionOnButtonClick, actionOnListItemClick) {
        this.actionName = actionName;
        this.actionOnButtonClick = actionOnButtonClick;
        this.actionOnListItemClick = actionOnListItemClick;
    }

    getActionName() {
        return this.actionName;
    }

    getActionOnButtonClick() {
        return this.actionOnButtonClick;
    }

    getActionOnListItemClick() {
        return this.actionOnListItemClick;
    }

    setActionName(actionName) {
        this.actionName = actionName;
    }

    setActionOnButtonClick(actionOnButtonClick) {
        this.actionOnButtonClick = actionOnButtonClick;
    }

    setActionOnListItemClick(actionOnListItemClick) {
        this.actionOnListItemClick = actionOnListItemClick;
    }
}