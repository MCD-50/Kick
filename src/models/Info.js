
export class Info {
    constructor(buttonText, isInteractiveChat, isInteractiveList, listItems, fields) {
        this.buttonText = buttonText;
        this.isInteractiveChat = isInteractiveChat;
        this.isInteractiveList = isInteractiveList;
        this.listItems = listItems;
        this.fields = fields;
    }

    getButtonText() {
        return this.buttonText;
    }

    getIsInteractiveChat() {
        return this.isInteractiveChat;
    }

    getIsInteractiveList() {
        return this.isInteractiveList;
    }

    getListItems() {
        return this.listItems;
    }

    getFields() {
        return this.fields;
    }

    setButtonText(buttonText) {
        this.buttonText = buttonText;
    }

    setIsInteractiveChat(isInteractiveChat){
        this.isInteractiveChat = isInteractiveChat;
    }

    setIsInteractiveList(isInteractiveList){
        this.isInteractiveList = getIsInteractiveList;
    }

    setListItems(listItems){
        this.listItems = listItems;
    }

    setFields(fields){
        this.fields = fields;
    }
}