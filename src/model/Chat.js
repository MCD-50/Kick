
export class Chat {

    constructor(name, latestMsg, image, newMsgCount, longLatestMessage = '', type) {
            this.name = name;
            this.latestMsg = latestMsg;
            this.image = image;
            this.newMsgCount = newMsgCount;
            this.longLatestMessage = longLatestMessage;
            this.type = type;
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

    getType(){
        return this.type;
    }

    setType(type){
        this.type = type;
    }
}


