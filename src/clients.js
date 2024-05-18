const Clients = class {
    constructor(id, name, ws) {
        this.id = id;
        this.name = name;
        this.ws = ws;
    }

    getId() {
        return this.id;
    }
    setId(id) {
        this.id = id;
    }

    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }

    getWs() {
        return this.ws;
    }
    setWs(ws) {
        this.ws = ws;
    }
}

module.exports = Clients;