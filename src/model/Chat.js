
export class Chat {

    constructor(name, latestMsg, image, newMsgCount) {
            this.name = name,
            this.latestMsg = latestMsg,
            this.image = image,
            this.newMsgCount = newMsgCount
    }


    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getLatestMsg() {
        return this.latestMsg;
    }

    getImage() {
        return this.image;
    }

    getNewMsgCount() {
        return this.newMsgCount;
    }

    setId(id) {
        this.id = id;
    }

    setName(name) {
        this.name = name;
    }

    setLatestMsg(latestMsg) {
        this.latestMsg = latestMsg;
    }

    setImage(image) {
        this.image = image;
    }

    setNewMsgCount(newMsgCount) {
        this.newMsgCount = newMsgCount;
    }

    setLongLatestMessage(longLatestMessage){
        this.longLatestMessage = longLatestMessage;
    }

    getLongLatestMessage(){
        return this.longLatestMessage;
    }
}


