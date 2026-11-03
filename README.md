# Iron Arena — base de prototype 3D

Jeu de combat original en JavaScript / Three.js. Objectif visuel : époque PlayStation / Tekken 3. **Cette version ne possède pas encore la qualité graphique ou les animations de Tekken 3.** Les personnages utilisent désormais les modèles humains texturés et les animations squelettiques Quaternius (CC0). Voir ASSET-CREDITS.md.

## Inclus
- Deux personnages humains Quaternius (Kaï et Aya), cheveux et textures embarqués, arène de toit en 3D, éclairage et ombres.
- Solo contre IA (3 niveaux) et deux joueurs sur le même clavier.
- Déplacement latéral et en profondeur, poings, pieds, garde, spécial chargé et combo poing-pied.
- Deux manches gagnantes, chronomètre, pause et commandes tactiles.
- Three.js r170 inclus localement : aucune requête CDN nécessaire.

## GitHub Pages
Décompresser l’archive et déposer son contenu à la racine d’un dépôt GitHub. Le fichier index.html doit être à la racine. Dans les paramètres Pages du dépôt, sélectionner le déploiement depuis la branche principale, dossier racine, puis enregistrer. Ouvrir l’URL fournie par GitHub après publication. Aucun serveur applicatif ni compilation nécessaire.

## Test local
Exécuter `python -m http.server 8000` dans ce dossier, puis ouvrir http://localhost:8000. Ne pas ouvrir index.html directement par double-clic : les modules JavaScript nécessitent HTTP. WebGL 2 et l’accélération graphique sont requis.

## Commandes
J1 : Q/A et D = déplacement ; Z/W et S = profondeur ; J = poing ; K = pied ; L = garde ; I = spécial lorsque le nom affiche ⚡.
J2 : flèches ; 1 = poing ; 2 = pied ; 3 = garde ; 0 = spécial. Échap = pause.

## État et limites
La syntaxe et la logique des dégâts, de la garde et des manches ont été contrôlées. Le navigateur de validation a WebGL désactivé : le rendu 3D et ses performances n’ont pas pu être validés. Aucun multijoueur à distance n’est inclus ; le mode deux joueurs est local. Pas de manettes pour cette version.

Version 2 : modèles existants texturés, coiffures et animations importées (marche, coups de poing, garde, impacts et chute). Coup de pied procédural. Le rendu final reste à valider sur navigateur WebGL 2 ; les vérifications sans GPU contrôlent les modèles, leurs squelettes et les animations.

Création originale : aucun personnage, modèle, animation, son ni logo de Tekken. Three.js est fourni sous licence MIT (THREE-LICENSE.txt).
