export class Bot {

    constructor(name, sdescription, ldescription, avatar) {
        this.name = name;
        this.sdescription = sdescription;
        this.ldescription = ldescription;
        this.avatar = avatar;
    }

    getName() {
        return this.name;
    }

    getSDescription() {
        return this.sdescription;
    }

    getlDescription() {
        return this.ldescription;
    }

    getAvatar() {
        return this.avatar;
    }

    setName(name) {
        this.name = name;
    }

    setSDescription(sdescription) {
        this.sdescription = sdescription;
    }

    setSDescription(ldescription) {
        this.ldescription = ldescription;
    }

    setAvatar(avatar){
      this.avatar = avatar;
    }
}