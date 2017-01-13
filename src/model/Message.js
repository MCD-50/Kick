
export class Message {

    constructor(fromWhom, toWhom, text) {
        this.fromWhom = fromWhom;
        this.toWhom = toWhom;
        this.text = text;
    }

    getFromWhom() {
        return this.fromWhom;
    }

    getToWhom() {
        return this.toWhom;
    }


    getText() {
        return this.text;
    }

    setFromWhom(fromWhom) {
        this.fromWhom = fromWhom;
    }

    setToWhom(toWhom) {
        this.toWhom = toWhom;
    }

    setText(text) {
        this.text = text;
    }

}


