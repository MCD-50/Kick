
export class Message {

    constructor(userName, userId, text, createdOn, isAlert, info, action) {
        this.userName = userName;
        this.userId = userId;
        this.text = text;
        this.createdOn = createdOn;
        this.isAlert = isAlert;
        this.info = info;
        this.action = action;
    }

    getUserName() {
        return this.userName;
    }

    getUserId() {
        return this.userId;
    }

    getText() {
        return this.text;
    }

    getCreatedOn() {
        return this.createdOn;
    }

    getIsAlert() {
        return this.isAlert;
    }

    getInfo() {
        return this.info;
    }

    setUserName(userName) {
        this.userName = userName;
    }

    setUserId(userId) {
        this.userId = userId;
    }

    setText(text) {
        this.text = text;
    }

    setCreatedOn(createdOn) {
        this.createdOn = createdOn;
    }

    setIsAlert(isAlert) {
        this.isAlert = isAlert;
    }

    setInfo(info) {
        this.info = info;
    }

    setAction(action) {
        this.action = action;
    }
}


