//title, subTitle(Last Message Text), 
//image, badge, type, room, isMute, email, 
//lastActive, lastMessageTime, id

export class Chat {
    constructor(title, subTitle, image, badge, type, room, isMute, email) {
        this.title = title;
        this.subTitle = subTitle;
        this.image = image;
        this.badge = badge;
        this.type = type;
        this.room = room;
        this.isMute = isMute;
        this.email = email;
    }

    getId(){
        return this.id;
    }

    getTitle(){
        return this.title;
    }

    getSubTitle(){
        return this.subTitle;
    }

    getImage(){
        return this.image;
    }

    getBadge(){
        return this.badge;
    }

    getType(){
        return this.type;
    }

    getRoom(){
        return this.room;
    }

    getIsMute(){
        return this.isMute;
    }

    getLastActive(){
        return this.lastActive;
    }

    getEmail(){
        return this.email;
    }

    getLastMessageTime(){
        return lastMessageTime;
    }

    setId(id){
        this.id = id;
    }

    setTitle(title){
        this.title = title;
    }

    setSubTitle(subTitle){
        this.subTitle = subTitle;
    }

    setImage(image){
        this.image = image;
    }

    setBadge(badge){
        this.badge = badge;
    }

    setType(type){
        this.type = type;
    }

    setRoom(room){
        this.room = room;
    }

    setIsMute(isMute){
        this.isMute = isMute;
    }

    setLastActive(lastActive){
        this.lastActive = lastActive;
    }

    setEmail(email){
        this.email = email;
    }

    setLastMessageTime(lastMessageTime){
        this.lastMessageTime = lastMessageTime;
    }
}


