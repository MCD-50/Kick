
export class ChatItem {

    constructor(message, chat_room, chat_type) {
        this.message = message;
        this.chat_room = chat_room;
        this.chat_type = chat_type;
    }

    getChatItemRoom() {
        return this.chat_room;
    }

    getChatType() {
        return this.chat_type;
    }

    getMessage() {
        return this.message;
    }

    setMessage(message) {
        this.message = message;
    }

    setChatItemRoom(chat_room) {
        this.chat_room = chat_room;
    }

    setChatType(chat_type) {
        this.chat_type = chat_type;
    }

}


