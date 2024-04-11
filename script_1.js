class Character {
    constructor(hp, dmg, mana) {
        this.hp = hp;
        this.dmg = dmg;
        this.mana = mana;
    }
}

class Fighter extends Character {
    constructor() {
        super(12, 4, 40)
    }

    darkVision () {
        this.dmg += 1
    }
}

class Paladin extends Character {
    constructor() {
        super(16, 3, 160)
    }

    healingLighting () {

    }
}

class Monk extends Character {
    constructor() {
        super(8, 2, 200)
    }

    heal () {
        
    }
}