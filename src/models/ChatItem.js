
export class ChatItem {

    //message is an object refer Messaage.js for more info. 
    constructor(message, chatId) {
        this.message = message;
        this.chatId = chatId;
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

    setId(id) {
        this.id = id;
    }

    setMessage(message) {
        this.message = message;
    }

    setChatId(chatId) {
        this.chatId = chatId;
    }

}


