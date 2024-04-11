class Character {
    constructor(hp, mana, dmg) {
      this.hp = hp;
      this.maxHp = hp; // Ajout de maxHp pour garder une trace des PV max
      this.mana = mana;
      this.dmg = dmg;
      this.status = "playing"; // Par défaut, le personnage est en jeu
      this.game = null; // Référence vers le jeu
      this.hasPlayed = false; // Ajout d'une propriété pour suivre si le personnage a déjà joué dans le tour
    }
  
    // Méthode pour effectuer une attaque normale
    attaque(cible) {
      if (this.status === "playing") {
        const degatsInfliges = this.dmg; // Les dégâts sont définis par le personnage
        console.log(`${this.constructor.name} attaque ${cible.constructor.name} avec une attaque normale pour ${degatsInfliges} points de dégâts.`);
        cible.takeDamage(degatsInfliges);
        this.regainManaOnKill(cible);
        return degatsInfliges; // Retourne les dégâts infligés
      }
    }
  
    // Méthode à implémenter dans les sous-classes pour l'attaque spéciale
    attaqueSpeciale(cible) {
      // À implémenter dans les sous-classes
    }
  
    // Méthode pour prendre des dégâts
  takeDamage(damage) {
    if (this.status === "playing") {
      this.hp -= damage;
      if (this.hp <= 0) {
        this.status = "loser";
      }
    }
  }
  
    // Méthode pour infliger des dégâts à un autre personnage
    dealDamage(target) {
      if (this.status === "playing" && target.status === "playing") {
        target.takeDamage(this.dmg);
        this.regainManaOnKill(target);
      }
    }
  
    // Méthode pour regagner 20 points de mana après avoir tué un adversaire
    regainManaOnKill(target) {
      if (target.status === "loser") {
        this.mana += 20;
      }
    }
  
    // Méthode pour choisir une cible parmi les autres personnages
    chooseTarget() {
        const targets = this.game.characters.filter(
          (character) => character !== this && character.status === "playing"
        );
  
        // Ajouter le joueur humain comme une cible potentielle s'il existe et est en jeu
        if (this.game.humanPlayer && this.game.humanPlayer.status === "playing") {
          targets.push(this.game.humanPlayer);
        }
    
        // Exclure les personnages dont le statut est "loser"
        const aliveTargets = targets.filter((character) => character.status !== "loser");
    
        if (aliveTargets.length > 0) {
          const randomIndex = Math.floor(Math.random() * aliveTargets.length);
          return aliveTargets[randomIndex];
        }
        return null; // Aucune cible disponible
      }
  
    // Méthode pour gérer le tour du personnage
    play() {
        if (this.status === "playing" && this.hp > 0 && this.game.playersInGame > 1 && !this.hasPlayed) {
            const target = this.chooseTarget();
            if (target) {
                this.chooseAction(target);
            }
            this.hasPlayed = true; // Marquer le personnage comme ayant joué
        }
    }


    enemyPlay() {
        if (this.status === "playing" && this.hp > 0 && this.game.playersInGame > 1 && !this.hasPlayed) {
            const target = this.chooseTarget();
            if (target) {
                this.chooseAction(target);
            }
            this.hasPlayed = true; // Marquer le personnage comme ayant joué
        }
    }
  }
  
  class HumanPlayer extends Character {
    constructor(name, characterClass) {
        // Appelez le constructeur de la classe mère en passant les valeurs nécessaires
        super(characterClass.hp, characterClass.mana, characterClass.dmg);
        this.name = name;
        this.characterClass = characterClass;
    }

    chooseAction(cible) {
        const actionChoice = prompt(`${this.name} (${this.constructor.name}), choisissez votre action :\n1. Attaque normale\n2. Attaque spéciale`);
        if (actionChoice === "1") {
            const degatsInfliges = this.attaque(cible); // Récupère les dégâts infligés
            console.log(`${this.name} (${this.constructor.name}) attaque ${cible.name} (${cible.constructor.name}) avec une attaque normale pour ${degatsInfliges} points de dégâts.`);
        } else if (actionChoice === "2") {
            this.attaqueSpeciale(cible);
        } else {
            console.log("Choix d'action non valide. Utilisation de l'attaque normale.");
            const degatsInfliges = this.attaque(cible); // Récupère les dégâts infligés
            console.log(`${this.name} (${this.constructor.name}) attaque ${cible.name} (${cible.constructor.name}) avec une attaque normale pour ${degatsInfliges} points de dégâts.`);
        }
    }

    attaqueSpeciale(cible) {
        if (this.mana >= this.characterClass.specialManaCost) {
            console.log(`${this.name} (${this.constructor.name}) utilise une attaque spéciale sur ${cible.name} (${cible.constructor.name}) pour ${this.characterClass.specialDamage} points de dégâts.`);
            cible.hp -= this.characterClass.specialDamage;
            this.mana -= this.characterClass.specialManaCost;
        } else {
            console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
            this.attaque(cible); // Attaque normale en cas de mana insuffisant
        }
    }

    chooseTarget() {
        console.log("Cibles disponibles :");
        const enemies = this.game.characters.filter(
          (character) => character !== this && character.hp > 0 && character instanceof Character
        );
        enemies.forEach((enemy, index) => {
          console.log(`${index + 1}. ${enemy.name} (${enemy.constructor.name}) - ${enemy.hp} PV`);
        });
      
        let chosenIndex = prompt("Choisissez le numéro de l'ennemi que vous souhaitez attaquer :");
        chosenIndex = parseInt(chosenIndex) - 1;
      
        if (!isNaN(chosenIndex) && chosenIndex >= 0 && chosenIndex < enemies.length) {
          const chosenEnemy = enemies[chosenIndex];
          return chosenEnemy;
        }
      
        console.log("Choix d'ennemi non valide. Attaque aléatoire.");
        return super.chooseTarget();
      }
}
  
  // Classe Fighter, sous-classe de Character
  class Fighter extends Character {
    constructor(name) {
      super(12, 40, 4); // Initialisez les PV, mana et dégâts ici
      this.name = name;
    }
  
    // Méthode pour choisir l'action à effectuer
    chooseAction(cible) {
      if (this.mana >= 20) {
        this.attaqueSpeciale(cible);
      } else {
        this.attaque(cible);
      }
    }
  
    // Méthode pour l'attaque spéciale du Fighter
    attaqueSpeciale(cible) {
      if (this.mana >= 20) {
        const degatsInfliges = Math.min(5, cible.hp); // Calcul des dégâts infligés, limité à la santé actuelle de la cible
        console.log(`${this.constructor.name} utilise une attaque spéciale sur ${cible.constructor.name} pour ${degatsInfliges} points de dégâts.`);
        cible.hp -= degatsInfliges;
        this.mana -= 20;
        this.takeLessDamageNextTurn = true;
      } else {
        console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
      }
    }
  }
  
  // Classe Paladin, sous-classe de Character
  class Paladin extends Character {
    constructor(name) {
      super(16, 160, 3); // Initialisez les PV, mana et dégâts ici
      this.name = name; // Utilisez le nom passé en argument pour définir le nom du personnage
    }
  
    // Méthode pour choisir l'action à effectuer
    chooseAction(cible) {
      if (this.mana >= 40) {
        this.attaqueSpeciale(cible);
      } else {
        this.attaque(cible);
      }
    }
  
    // Méthode pour l'attaque spéciale du Paladin
    attaqueSpeciale(cible) {
      if (this.mana >= 40) {
        console.log(`${this.constructor.name} utilise une attaque spéciale sur ${cible.constructor.name} pour 4 points de dégâts.`);
        cible.hp -= 4;
        this.hp += 8; // Soigner le Paladin de 8 points de vie
        this.mana -= 40;
      } else {
        console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
        this.attaque(cible); // Attaque normale en cas de mana insuffisant
      }
    }
  }
  
  // Classe Monk, sous-classe de Character
  class Monk extends Character {
    constructor(name) {
      super(8, 200, 2); // Initialisez les PV, mana et dégâts ici
      this.name = name; // Utilisez le nom passé en argument pour définir le nom du personnage
    }
  
    // Méthode pour choisir l'action à effectuer
    chooseAction(cible) {
      if (this.mana >= 25) {
        this.attaqueSpeciale();
      } else {
        this.attaque(cible);
      }
    }
  
    // Méthode pour l'attaque spéciale du Monk
    attaqueSpeciale() {
      if (this.mana >= 25) {
        console.log(`${this.constructor.name} utilise une attaque spéciale pour se soigner de 8 points de vie.`);
        this.hp += 6; // Soigner le Monk de 6 points de vie
        this.mana -= 25;
      } else {
        console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
        this.attaque(cible); // Attaque normale en cas de mana insuffisant
      }
    }
  }
  
  // Classe Berzerker, sous-classe de Character
  class Berzerker extends Character {
    constructor(name) {
      super(8, 0, 4); // Initialisez les PV, mana et dégâts ici
      this.name = name; // Utilisez le nom passé en argument pour définir le nom du personnage
      this.hasRage = false; // Le Berzerker n'a pas encore activé la rage
    }
  
    // Méthode pour choisir l'action à effectuer
    chooseAction(cible) {
      if (!this.hasRage) {
        this.attaqueSpeciale(cible);
      } else {
        this.attaque(cible);
      }
    }
  
    // Méthode pour l'attaque spéciale du Berzerker
    attaqueSpeciale(cible) {
      if (!this.hasRage) {
        console.log(`${this.constructor.name} active la rage et inflige 1 point de dégât supplémentaire à ${cible.constructor.name}.`);
        this.hasRage = true; // Activer la rage
        this.dmg += 1; // Augmenter les dégâts du Berzerker de 1
        this.hp -= 1; // Enlever 1 point de vie au Berzerker
      } else {
        console.log("Le Berzerker est déjà enragé.");
        this.attaque(cible); // Attaque normale en cas de rage activée
      }
    }
  }
  
  // Classe Assassin, sous-classe de Character
  class Assassin extends Character {
    constructor(name) {
      super(6, 20, 6); // Initialisez les PV, mana et dégâts ici
      this.name = name; // Utilisez le nom passé en argument pour définir le nom du personnage
      this.hasShadowHit = false; // L'Assassin n'a pas encore utilisé Shadow Hit
    }
  
    // Méthode pour choisir l'action à effectuer
    chooseAction(cible) {
      if (this.mana >= 15) {
        this.attaqueSpeciale(cible);
      } else {
        this.attaque(cible);
      }
    }
  
    // Méthode pour l'attaque spéciale de l'Assassin
    attaqueSpeciale(cible) {
      if (this.mana >= 20) {
        if (!this.hasShadowHit) {
          console.log(`${this.constructor.name} utilise Shadow Hit sur ${cible.constructor.name} pour 7 points de dégâts.`);
          this.hasShadowHit = true;
          cible.hp -= 7;
          if (cible.hp > 0) {
            this.hp -= 7;
          }
          this.mana -= 20;
        } else {
          console.log("L'Assassin a déjà utilisé Shadow Hit.");
          this.attaque(cible); // Attaque normale en cas de Shadow Hit déjà utilisé
        }
      } else {
        console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
        this.attaque(cible); // Attaque normale en cas de mana insuffisant
      }
    }
  }
  
  class Wizard extends Character {
    constructor(name) {
      super(10, 200, 2); // Initialisez les PV, mana et dégâts ici
      this.name = name; // Utilisez le nom passé en argument pour définir le nom du personnage
    }
  
    chooseAction(cible) {
      if (this.mana >= 25) {
        this.attaqueSpeciale(cible);
      } else {
        this.attaque(cible);
      }
    }
  
    attaqueSpeciale(cible) {
      if (this.mana >= 25) {
        console.log(`${this.name} (${this.constructor.name}) lance une Fireball sur ${cible.name} (${cible.constructor.name}) pour 7 points de dégâts.`);
        cible.hp -= 8;
        this.mana -= 25;
      } else {
        console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
        this.attaque(cible); // Attaque normale en cas de mana insuffisant
      }
    }
  }
  
  class Archer extends Character {
    constructor(name) {
      super(8, 80, 3); // Initialisez les PV, mana et dégâts ici
      this.name = name; // Utilisez le nom passé en argument pour définir le nom du personnage
    }
  
    chooseAction(cible) {
      if (this.mana >= 20) {
        this.attaqueSpeciale(cible);
      } else {
        this.attaque(cible);
      }
    }
  
    attaqueSpeciale(cible) {
      if (this.mana >= 20) {
        console.log(`${this.name} (${this.constructor.name}) tire une Flèche Empoisonnée sur ${cible.name} (${cible.constructor.name}) pour 5 points de dégâts.`);
        cible.hp -= 6;
        this.mana -= 20;
      } else {
        console.log("Pas assez de mana pour utiliser l'attaque spéciale.");
        this.attaque(cible); // Attaque normale en cas de mana insuffisant
      }
    }
  }
  
  const randomAINames = ["Orc", "Troll", "Goblin", "Skeleton", "Dragon", "Witch", "Warlock", "Vampire", "Zombie", "Specter"];
  
  
  // Classe Game pour gérer le jeu
  class Game {
    constructor() {
      this.turnLeft = 10; // Nombre de tours restants par défaut
      this.characters = []; // Tableau pour stocker les personnages
      this.playersInGame = 0; // Compteur pour garder une trace des joueurs encore en jeu
    }
  
    // Méthode pour ajouter un personnage au jeu
    addCharacter(character) {
      this.characters.push(character);
      character.game = this; // Référence vers le jeu
      this.playersInGame++;
    }
  
    createPlayers() {
      const addPlayer = prompt("Voulez-vous ajouter un personnage avant le début de la partie ? (oui/non)");
      
      if (addPlayer.toLowerCase() === "oui") {
        const playerName = prompt("Entrez votre nom :");
        const playerClass = prompt("Choisissez votre classe (Fighter, Paladin, Monk, Berzerker, Assassin, Wizard, ou Archer) :");
        const validPlayerClasses = ["Fighter", "Paladin", "Monk", "Berzerker", "Assassin", "Wizard", "Archer"];
    
        let playerCharacterClass = null;
    
        if (validPlayerClasses.includes(playerClass)) {
          // Trouver la classe de personnage correspondante
          playerCharacterClass = characterClasses.find((c) => c.name === playerClass);
        } else {
          console.log("Classe de personnage non valide. Utilisation de la classe Fighter.");
          // Utiliser la classe Fighter par défaut
          playerCharacterClass = characterClasses.find((c) => c.name === "Fighter");
        }
    
        const humanPlayer = new HumanPlayer(playerName, playerCharacterClass);
        this.addCharacter(humanPlayer);
      }
    
      const enemyClasses = [Fighter, Paladin, Monk, Berzerker, Assassin, Wizard, Archer];
    
      for (let i = 0; i < 4; i++) {
        const enemyClass = enemyClasses[Math.floor(Math.random() * enemyClasses.length)];
    
        // Générez un nom aléatoire pour l'ennemi
        const randomName = randomAINames[Math.floor(Math.random() * randomAINames.length)];
    
        const enemy = new enemyClass(randomName); // Utilisez le nom généré aléatoirement
        this.addCharacter(enemy);
      }
    }
  
    // Méthode pour vérifier si le jeu est terminé
    isGameOver() {
        return this.turnLeft <= 0 || this.playersInGame <= 1;
    }
  
    // Méthode pour afficher l'état actuel du jeu
    displayStatus() {
      console.log("État actuel du jeu :");
      this.characters.forEach((character) => {
        console.log(
          `${character.name} (${character.constructor.name}): ${character.hp} PV, ${character.mana} mana, ${
            character.status
          }`
        );
      });
      console.log(`Tours restants : ${this.turnLeft}`);
    }
  
    // Méthode pour exécuter un tour de jeu
    playTurn() {
        if (!this.isGameOver()) {
            console.log("========================================");
            console.log(`           Tour ${11 - this.turnLeft}           `);
            console.log("========================================");
            this.characters.forEach((character) => {
                if (!this.isGameOver()) {
                    character.play();
                    // Si le personnage est un ennemi, laissez-le attaquer
                    if (!(character instanceof HumanPlayer)) {
                        character.enemyPlay();
                    }
                }
            });
            this.characters.forEach((character) => {
                character.hasPlayed = false; // Réinitialiser le statut "a joué" pour tous les personnages après le tour
            });
            this.displayStatus();
            this.turnLeft--;
            if (this.turnLeft === 0) {
                console.log("========================================");
                console.log("      🎮  Le jeu est terminé !  🎮      ");
                console.log("========================================");
                const remainingPlayers = this.characters.filter((character) => character.status === "playing");
                if (remainingPlayers.length === 1) {
                    console.log(`Le joueur gagnant est ${remainingPlayers[0].name} (${remainingPlayers[0].constructor.name}) \x1b[31m👑\x1b[0m !`);
                } else {
                    if (remainingPlayers.length === 0) {
                        console.log("Game Over! Tous les joueurs ont été éliminés.");
                    } else {
                        console.log("Le jeu se termine sans vainqueur.");
                    }
                }
            }
        }
    }
  
    // Méthode pour démarrer le jeu
    startGame() {
      console.log("========================================");
      console.log("     \x1b[33m🎮 RPG THP 🎮\x1b[0m      ");
      console.log("========================================");
      this.createPlayers();
      this.displayStatus();
      while (!this.isGameOver()) {
        this.playTurn();
      }
    }
  }
  
  // Tableau des classes de personnages
  const characterClasses = [
    { name: "Fighter", hp: 12, mana: 40, dmg: 4, specialDamage: 0, specialManaCost: 0 },
    { name: "Paladin", hp: 16, mana: 160, dmg: 3, specialDamage: 4, specialManaCost: 40 },
    { name: "Monk", hp: 8, mana: 200, dmg: 2, specialDamage: 6, specialManaCost: 25 },
    { name: "Berzerker", hp: 8, mana: 0, dmg: 4, specialDamage: 0, specialManaCost: 0 },
    { name: "Assassin", hp: 6, mana: 20, dmg: 6, specialDamage: 7, specialManaCost: 20 },
    { name: "Wizard", hp: 10, mana: 200, dmg: 2, specialDamage: 8, specialManaCost: 25 },
    { name: "Archer", hp: 8, mana: 80, dmg: 3, specialDamage: 6, specialManaCost: 20 },
];
  
  // Création de l'instance de jeu
  const game = new Game();
  
  // Démarrage du jeu
  console.log(game.startGame());
