
export class ChatItem {

    //message is an object refer Messaage.js for more info. 
    constructor(message, chatId, type) {
        this.message = message;
        this.chatId = chatId;
        this.type = type;
    }

    getId() {
        return this.id;
    }

    getChatId() {
        return this.chatId;
    }

    getMessage() {
        return this.message;
    }

    getType() {
        return this.type;
    }

    setId(id) {
        this.id = id;
    }

    setMessage(message) {
        this.message = message;
    }

    setChatId(chatId) {
        this.chatId = chatId;
    }

    setType(type) {
        this.type = type;
    }

}


