

import { BotMessageType } from '../enum/BotMessageType.js';

export class Type {

    constructor(type, message = '', array = []) {
        console.log(type, message);
        this.type = type;
        this.message = message;
        this.array = array;
    }

    getType() {
        return this.type;
    }

    getMessage() {
        //if (this.type == BotMessageType.STRING)
        return this.message;
        //return this.array;
    }

}


