export class Params{
    constructor(id, userName, avatar, type) {
        this.id = id,
        this.userName = userName,
        this.avatar = avatar,
        this.type = type;
    }

    getId(){
        return this.id;
    }

    getUserName(){
        return this.userName;
    }

    getAvatar(){
        return this.avatar;
    }

    setId(id){
        this.id = id;
    }

    setUserName(userName){
        this.userName = userName;
    }

    setAvatar(avatar){
        this.avatar = avatar;
    }

    setType(type){
        this.type = type;
    }

    getType(){
        return this.type;
    }
}