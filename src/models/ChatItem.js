
export class ChatItem {

    constructor(message, chat_id, chat_type) {
        this.message = message;
        this.chat_id = chat_id;
        this.chat_type = chat_type;
    }

    getId() {
        return this._id;
    }

    getChatId() {
        return this.chat_id;
    }

    getChatType() {
        return this.chat_type;
    }

    getMessage() {
        return this.message;
    }

    setId(_id) {
        this._id = _id;
    }

    setMessage(message) {
        this.message = message;
    }

    setChatId(chatId) {
        this.chat_id = chat_id;
    }

    setChatType(chat_type) {
        this.chat_type = chat_type;
    }

}


