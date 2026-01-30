import { type } from 'node:os';
import fs from "fs";
import readline from 'node:readline/promises';
const rl = readline.createInterface({ // pour avoir l'interaction programme / clavier
  input: process.stdin,
  output: process.stdout
});
async function creer_partie(nb_joueurs){
  let joueurs = [];
  for (let i = 1 ; i <= nb_joueurs; i++){
    let joueur_supp 
          do {
            console.log(`Note : si le nom existe déjà, tu vas devoir saisir un nom jusqu'à ce qu'il ne soit pas déjà pris`);
            console.log(`La liste des joueurs déjà inscrits est : ${joueurs.map(joueur => joueur.nom)}`);

            joueur_supp = await rl.question("Donne le nom d'un joueur ! \n -> ");
          } while (joueurs.some(j => j.nom === joueur_supp)); // tant que le nom donné est déjà dans la liste on itère dans la boucle
    joueurs.push(creerJoueur(joueur_supp));
  }
  return joueurs; // retourne la liste des joueurs
}
class Joueur { 
  constructor(nom) {
    this.nom = nom;
    this.score = 0;
    this.score_tour = 0;
    this.cartes = [];
    this.tour = true;
  }
}
function creerJoueur(joueur){
  return new Joueur(joueur);
}
function nombre(carte,joueur){ // cas spécifique où la carte tirée est de type "nombre" càd 1,2,3,4,5,6,7,8,9,10,11,12
  if (déjà_dans_deck(carte,joueur.cartes)){
      if (joueur.cartes.includes("second chance")){ // le joueur a deux cartes identiques MAIS à la carte seconde chance qu'on défausse donc
        let index = joueur.cartes.indexOf("second chance");
        joueur.cartes.splice(index,1);                   
      }
      else{ // le joueur ne peut plus jouer et ne marque aucun point du tour
        joueur.tour = false; // n'est plus autorisé à jouer
        joueur.score_tour = 0;
        return "2 identiques !"; // on fait remonter l'information que le joueur concerné à eu 2 fois la même carte
      }
  }
  else{
    joueur.score_tour += carte;
    if (sept_nombres(joueur)){
      joueur.score_tour += 15
      if (plus_de_200(joueur)){ // si quelqu'un à gagner et à 7 cartes "nombres" on le fait remonter aussi !
        return joueur; 
      }
      else{
        return "Plus de sept nombres dans le tour !!";
      }
    }
    else if (plus_de_200(joueur)){ // si quelqu'un à gagner sans forcément avoir 7 cartes "nombres"
      return joueur;
    }         
  }  
}
function carte_nb_special(carte,joueur){
  if (carte === "+2" || carte === "+6" || carte === "+8" || carte === "+10"){ // à noter que ce sont des cartes différentes que les "nombres" car elles ne comptent pas dans les 7 
  let bonus = Number(carte);
        joueur.score_tour += bonus;
        if (plus_de_200(joueur)){
          return joueur;
        }
      }
}
async function freeze(carte,joueur,joueurs){
  if (joueurs.length === 1){ // si le joueur est seul, c'est lui qui prend le freeze
          joueur.score_tour = 0;
          joueur.tour = false;
          return;
        }       
  else{
    let joueur_cible
    do {
        joueur_cible = await rl.question("Donne le nom d'un joueur à cibler: \n -> ");
    } while (!joueurs.some(j => j.nom === joueur_cible)); // tant que le joueur donné est pas valide (joueurs.some(j => j.nom === joueur_cible) est une fonction qui cherche pour tous les élements elem de la liste si elem.nom == joueur_cible)
      for (const player of joueurs){ // On trouve le joueur correspondant
        if (player.nom === joueur_cible){
            player.score_tour = 0; // application du freeze 
            player.tour = false;              
        }
      }
      }
}
async function flip_three(joueur,jeu,joueurs){
  if (joueurs.length === 1){
            for (let i = 1; i<=3;i++){
                  let new_carte = distribuer(jeu,joueur);
                  let a = await effet(jeu,new_carte,joueur,joueurs);  
                  if (a === "Plus de sept nombres dans le tour !!"){
                    return "Plus de sept nombres dans le tour !!";

                  }
                  else if (joueur + joueur.score_tour >= 200){
                    return joueur;
                  }
            }
  }  
        else{ // si le joueur n'est pas seul il choisit une cible
          let joueur_cible
          do {
            joueur_cible = await rl.question("Donne le nom d'un joueur à cibler: \n -> ");
          } while (!joueurs.some(j => j.nom === joueur_cible));
          for (const player of joueurs){
              if (player.nom === joueur_cible){
                for (let i = 1; i<=3;i++){ // il pioche trois cartes. IMPORTANT : si dans ces cartes il y a des effets spéciaux (ex plus de 200, plus de sept nombres, il faut le faire remonter pour arrêter le tour immédiatement !! Par contre les cartes freeze et flip three appliquent les effet dés qu'elles sont tirées donc pas besoin de les notifier)
                  let new_carte = distribuer(jeu,player);
                  let a = await effet(jeu,new_carte,player,joueurs); // note : le "await" signifie qu'on est dans une fonction asyncrone autrement dit on sollicite l'utilisateur et donc on attend sa réponse quand on tape une commande rl (sinon le jeu continue sans attendre la réponse du joueur)
                  if (a === "Plus de sept nombres dans le tour !!"){
                    return "Plus de sept nombres dans le tour !!";
                  }
                  else if (joueur_cible.score + joueur_cible.score_tour >= 200){
                    return joueur_cible;
                  }
                
                  }               
                }
                  
                }
              }
}
async function effet(jeu,carte,joueur,joueurs){
  if (carte != null){ // si le joueur à tour = true donc peut jouer (voir la fonction distribuer)
            if (typeof (carte) === "number"){ // on distingue deux types différents : les nombres et les cartes spéciales et on applique les fonctions correspondantes en fonction de la carte 
              let a = nombre(carte,joueur);
              if (a instanceof Joueur){ // IMPORTANT : si carte retourne joueur, c'est que ce joueur là à gagner et c'est le SEUL cas où une carte retourne un joueur donc on sait si on reçoit une variable de la classe "Joueur" que ce joueur à forcément gagné !
                return joueur;
              }
              else if (a === "Plus de sept nombres dans le tour !!"){
                return "Plus de sept nombres dans le tour !!"
              }
              else if (a === "2 identiques !"){
                return "2 identiques !"
              }
            }
  else{
      if (carte === "+2" || carte === "+6" || carte === "+8" || carte === "+10"){ // le joueur peut aussi gagner avec ces cartes bonus 
        let a = carte_nb_special(carte,joueur);
        if (a === joueur){
          return joueur;
        }
      }
      else if (carte === "freeze"){
        await freeze(carte,joueur,joueurs);
          }
      else if (carte === "flip three"){
        let a = await flip_three(joueur,jeu,joueurs);
        if (a === "Plus de sept nombres dans le tour !!"){
          return "Plus de sept nombres dans le tour !!";
        }
        if (a instanceof Joueur){ // IMPORTANT : si carte retourne joueur, c'est que ce joueur là à gagner et c'est le SEUL cas où une carte retourne un joueur donc on sait si on reçoit une variable de la classe "Joueur" que ce joueur à forcément gagné !
            return joueur;
        }
      }     
  }
  }
}
function plus_de_200(joueur){
  if (joueur.cartes.includes("x2")){ // important aussi, le x2 n'est pas appliqué directement au score du joueur sur le tour, car si le tour continue, le x2 n'aura pas effet sur les cartes suivantes, la solution est donc de calculer séparément le score théorique si le x2 était appliqué et si il dépasse 200, on arrête le jeu
      return (joueur.score + joueur.score_tour*2 >= 200);
  }
  else{
    return (joueur.score + joueur.score_tour >= 200);
  }
}

function déjà_dans_deck(carte,deck){ // fonction qui s'applique lorsque le joueur a tiré sa carte donc on doit vérifier si elle est en 2 exemplaires
  let compteur = 0;
  for (let i = 0;i<deck.length;i++){
    if (deck[i] === carte){
      compteur += 1;
      if (compteur ===2){
        return true;
      }
    } 
  }
  return false
}
function generer_jeu() {
    let jeu = [0];
    for (let i = 1; i <= 12;i++){ // on génère un 1, deux 2 , trois 3 etc...
        for (let j = 1 ; j <= i ; j++){
            jeu.push(i);
        }
    }
    jeu.push("x2");
    jeu.push("+2");
    jeu.push("+2");
    jeu.push("+6");
    jeu.push("+8");
    jeu.push("+10");
    jeu.push("freeze");
    jeu.push("freeze");
    jeu.push("freeze");
    jeu.push("flip three");
    jeu.push("flip three");
    jeu.push("flip three");
    jeu.push("second chance");
    jeu.push("second chance");
    jeu.push("second chance");
    return jeu;
}
function melanger(jeu) { // Mélange Fisher–Yates
  for (let i = jeu.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [jeu[i], jeu[j]] = [jeu[j], jeu[i]];
  }
  return jeu;
}
function joueurs_tour(joueurs){ // compte le nombre de joueurs qui peuvent jouer au tour (doit être > 0 pour que le tour continue)
  let peut_jouer = 0;
  for (const joueur of joueurs){
    if (joueur.tour === true){
      peut_jouer += 1;
    }
  }
  return peut_jouer;
}
function distribuer(jeu,joueur){
    let carte = null;
    if (joueur.tour === true){  // si le joueur peut jouer on lui distribue une carte sinon la carte est null
      carte = jeu.pop();
      joueur.cartes.push(carte);
    }
    return carte;
}
function sept_nombres(joueur){ // vér
  let compteur = 0;
  for (const carte of joueur.cartes){
       if (typeof (carte) === "number"){ // on ne compte pas les cartes spéciales ...
        compteur += 1;
      }
  }
  return (compteur >= 7);
}
function afficher_ordre(joueurs){
  console.log("L'ordre de passage est :")
  for (const joueur of joueurs){
    console.log(joueur.nom);
  }
}
async function tour(joueurs){ // simule un seul tour
  let jeu = generer_jeu(); // on mélange un nouveau jeu
  jeu = melanger(jeu);
    while (joueurs_tour(joueurs) > 0){ // tant que quelqu'un peut jouer
      for (const joueur of joueurs){ // on parcourt les joueurs
        if (joueur.tour === true){ // si le joueur peut jouer on lui demande si il veut piocher
          console.log(`A ${joueur.nom} de jouer, ton jeu est ${joueur.cartes}`);
          let choix 
          do {
            choix = await rl.question(`Veux-tu piocher (y ou n) ? `);
          } while (!(["y","n"].includes(choix)));
          if (choix === "n"){
            joueur.tour = false; // le joueur s'est couché
          }
        }
        let carte = distribuer(jeu,joueur);
        if (carte === null){
          console.log(`${joueur.nom} ne peut plus jouer, son jeu est : ${joueur.cartes}`);
        }
        else{
          console.log(`${joueur.nom} a pioché un ${carte}`);
        }
        let a = await effet(jeu,carte,joueur,joueurs); // application de la carte piochée
        if (a === "Plus de sept nombres dans le tour !!"){
          console.log(`${joueur.nom} a réussi à avoir plus de sept cartes !! Waouh !`);
          return; // le tour est fini (selon les règles)
        }
        else if (a === "2 identiques !"){
          console.log(`${joueur.nom} a eu deux fois la même carte ! Son tour est terminé et il n'obtiendra aucun point à la fin de la partie !`);
        }    
        else if (a instanceof Joueur){ // si effet nous a donné un Joueur c'est que c'est le gagnant rappelez-vous !
          return a // Le gagnant
        }
        
      }
    }
}
function fin_tour_et_reset(joueurs){
  for (const joueur of joueurs){
    if (joueur.cartes.includes("x2")){ // on applique le x2 qu'à la fin du tour pour être sûr d'appliquer à toutes les cartes !
      joueur.score_tour *= 2;
    }
    joueur.score += joueur.score_tour; // incrémentation du score global
    joueur.score_tour = 0; // réinitialisation des variables de tous les joueurs
    joueur.tour = true;
    joueur.cartes = []
  }
  joueurs = melanger(joueurs); // on mélange l'ordre de passage des joueurs
}
function affiche_score(joueurs){
  console.log(`----------------------------RECAPITULATIF DES SCORES ----------------------------\n`);
  fs.appendFileSync("resultats.txt",`----------------------------RECAPITULATIF DES SCORES ----------------------------\n`);
  for (const joueur of joueurs){
    fs.appendFileSync("resultats.txt",`${joueur.nom} a ${joueur.score} points ! \n`);
    console.log(`${joueur.nom} a ${joueur.score} points ! `);
  }
}

async function partie_complete(joueurs){
  afficher_ordre(joueurs);
  console.log("Début de partie !");
  let a = await tour(joueurs);
  while (!(a instanceof Joueur)){ // tant qu'on a pas trouvé un gagnant
    fin_tour_et_reset(joueurs);
    fs.appendFileSync("resultats.txt","C'est le début d'un nouveau tour !");
    console.log("C'est le début d'un nouveau tour !");
    affiche_score(joueurs);
    afficher_ordre(joueurs);
    a = await tour(joueurs);
  }
  fin_tour_et_reset(joueurs); // même si la partie est finie à ce stade, il faut mettre à jour les scores !
  console.log(`----------------------------------------------------------------------`)
  console.log(`----------------------------FIN DE PARTIE ----------------------------`);
  console.log(`----------------------------------------------------------------------`)
  console.log(`La partie est terminée, le gagnant est ${a.nom} avec un score de ${a.score} ! `);
  console.log(`Voici les scores de tous les participants `);
  fs.appendFileSync("resultats.txt",`----------------------------------------------------------------------\n`);
  fs.appendFileSync("resultats.txt",`----------------------------FIN DE PARTIE ----------------------------\n`);
  fs.appendFileSync("resultats.txt",`----------------------------------------------------------------------\n`);
  fs.appendFileSync("resultats.txt",`La partie est terminée, le gagnant est ${a.nom} avec un score de ${a.score} !\n `);
  fs.appendFileSync("resultats.txt",`Voici les scores de tous les participants\n `);
  affiche_score(joueurs);
  console.log(`Merci beaucoup d'avoir joué !`);
  fs.appendFileSync("resultats.txt",`Merci beaucoup d'avoir joué !`);
}
function printFlipSevenCard() { // fonction essentiellement esthétique ...
  console.log("┌───────────────┐");
  console.log("│               │");
  console.log("│   FLIP SEVEN  │");
  console.log("│               │");
  console.log("│       7       │");
  console.log("│               │");
  console.log("└───────────────┘");
}
async function main() {
  printFlipSevenCard()
  console.log(`Bienvenue dans flip seven !`)
  fs.writeFileSync("resultats.txt",`Bienvenue dans flip seven !\n`);
  let nb_joueurs 
          do {
            nb_joueurs = await rl.question(`Combien de joueurs dans la partie ? \n ->`);
          } while (isNaN(nb_joueurs) || nb_joueurs <= 0); // tant qu'on a pas un entier strictement positif en réponse ...
  let joueurs = await creer_partie(nb_joueurs);
  await partie_complete(joueurs);
  rl.close(); // sinon le programme tourne à l'infini. Il faut fermer rl 
}

main();
 