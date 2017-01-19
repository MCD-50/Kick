
export class ChatItem {

    constructor(chatId, fromUser, message, time) {
        this.chatId = chatId,
            this.fromUser = fromUser,
            this.message = message,
            this.time = time
    }

    getChatId() {
        return this.chatId;
    }

    getChatItemId() {
        return this.chatItemId;
    }

    getFromUser() {
        return this.fromUser;
    }

    getMessage() {
        return this.message;
    }

    getTime() {
        return this.time;
    }

    setChatId(chatId) {
        this.chatId = chatId;
    }

    setChatItemId(chatItemId) {
        this.chatItemId = chatItemId;
    }

    setFromUser(fromUser) {
        this.fromUser = fromUser;
    }

    setMessage(message) {
        this.message = message;
    }

    setTime(time) {
        this.time = time;
    }

}


