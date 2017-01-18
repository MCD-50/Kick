
export class Chat {

    constructor(fromWhomId, toWhomId, message) {
        this.fromWhomId = fromWhomId;
        this.toWhomId = toWhomId;
        this.message = message;
    }

    getFromWhomId() {
        return this.fromWhomId;
    }

    getToWhomId() {
        return this.toWhomId;
    }

    getMessage() {
        return this.message;
    }

    setFromWhomId(fromWhomId) {
        this.fromWhomId = fromWhomId;
    }

    setToWhomId(toWhomId) {
        this.toWhomId = toWhomId;
    }

    setMessage(message) {
        this.message = message;
    }

}


