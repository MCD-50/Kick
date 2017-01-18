export class Params{
    constructor(id, userName, avatar) {
        this.id = id,
        this.userName = userName,
        this.avatar = avatar
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
}