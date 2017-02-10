
export class Message {

    constructor(fromWhom, text, createdOn) {
        this.fromWhom = fromWhom;
        this.text = text;
        this.createdOn = createdOn;
    }

    getFromWhom() {
        return this.fromWhom;
    }

    getIsBot() {
        return this.isBot;
    }

    getText() {
        return this.text;
    }

    getCreatedOn() {
        return this.createdOn;
    }

    getButtonText() {
        return this.buttonText;
    }

    getList() {
        return this.buttonText;
    }

    getAction(){
        return this.action;
    }

    setFromWhom(fromWhom) {
        this.fromWhom = fromWhom;
    }

    setIsBot(isBot) {
        this.isBot = isBot;
    }

    setText(text) {
        this.text = text;
    }

    setCreatedOn(createdOn) {
        this.createdOn = createdOn;
    }

    setButtonText(buttonText) {
        this.buttonText = buttonText;
    }

    setList(list) {
        this.list = list;
    }

    setAction(action){
        this.action = action;
    }

}


