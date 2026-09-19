# My Future Path

Crée un prototype UX/UI interactif et responsive pour une application web française comparant une activité en micro-entreprise avec un emploi salarié.

L’objectif est uniquement d’explorer et valider l’expérience utilisateur. Ne développe pas encore de véritable moteur fiscal ou social, ne connecte aucun service externe et ne crée ni authentification, ni base de données, ni backend, ni projet Supabase. Utilise uniquement des données fictives en local.

Objectif du produit

L’application doit permettre à une personne de comparer deux scénarios :

- une activité en micro-entreprise ;
- une proposition ou une situation salariée.

La comparaison ne doit pas se limiter au revenu net. Elle doit rendre compréhensibles quatre dimensions distinctes :

1. Argent réellement disponible après cotisations, dépenses professionnelles et impôt.
2. Valeur économique annuelle incluant les avantages salariés.
3. Nombre de jours réellement travaillés dans chaque scénario.
4. Valeur économique obtenue par jour travaillé.

L’interface doit également expliquer qu’il peut exister plusieurs « salaires équivalents » :

- salaire donnant le même argent disponible ;
- salaire donnant la même valeur économique annuelle ;
- salaire donnant la même valeur par jour travaillé.

Il ne faut donc jamais afficher un unique salaire équivalent sans préciser le critère utilisé.

Parcours UX souhaité

Conçois une expérience hybride en deux temps.

1. Première simulation guidée

Présente un assistant en quatre étapes :

1. Situation générale et fiscale.
2. Activité en micro-entreprise.
3. Situation ou proposition salariée.
4. Résultats de la comparaison.

L’utilisateur doit toujours savoir :

- où il se trouve ;
- pourquoi une information est demandée ;
- si un montant est mensuel ou annuel ;
- si un salaire correspond au salaire réellement versé ou à un équivalent temps plein.

Les champs complexes doivent avoir une aide contextuelle courte et compréhensible.

2. Tableau de bord modifiable

Après la première simulation, affiche un tableau de bord comparatif permettant de modifier les hypothèses sans recommencer tout le parcours.

Sur ordinateur, les hypothèses « Micro-entreprise » et « Salariat » peuvent être présentées dans deux panneaux distincts.

Sur mobile, les deux scénarios doivent être affichés successivement, avec une navigation simple, sans essayer de forcer deux colonnes trop étroites.

Données à saisir

Profil commun

Prévoir visuellement des champs pour :

- année de référence ;
- situation fiscale simplifiée ;
- nombre de parts ou taux d’imposition personnalisé ;
- préférences d’affichage mensuel ou annuel.

Micro-entreprise

Prévoir notamment :

- type d’activité ;
- chiffre d’affaires annuel hors taxes ;
- ou calcul depuis un TJM et un nombre de jours facturés ;
- jours ou semaines non travaillés ;
- jours non facturés consacrés à l’administratif, la prospection ou la formation ;
- dépenses professionnelles réellement payées ;
- options fiscales principales.

Salariat

Prévoir notamment :

- salaire brut annuel ;
- distinction très visible entre salaire réellement versé et salaire équivalent temps plein ;
- pourcentage de temps de travail ;
- primes ;
- participation et intéressement ;
- tickets-restaurant avec parts employeur et salarié ;
- autres avantages ;
- congés payés ;
- RTT ;
- éventuels jours supplémentaires offerts.

Les champs secondaires doivent être regroupés dans des sections repliables afin de ne pas rendre l’écran intimidant.

Écran de résultats

L’écran de résultats doit afficher immédiatement quatre indicateurs principaux pour chaque scénario :

- net disponible après impôt ;
- valeur économique annuelle ;
- jours réellement travaillés ;
- valeur économique par jour travaillé.

Ajoute ensuite :

- l’écart entre les deux scénarios en euros et en pourcentage ;
- un graphique comparatif simple ;
- une décomposition permettant de comprendre comment on passe du revenu brut au résultat final ;
- une zone dédiée aux différents salaires équivalents ;
- une section séparée sur la protection sociale et les droits associés ;
- un panneau « Hypothèses et sources » ;
- des avertissements visibles lorsque certaines valeurs reposent sur une estimation.

Évite les graphiques décoratifs. Chaque visualisation doit permettre de comprendre une différence réelle.

La protection sociale ne doit pas être artificiellement additionnée au revenu avec une valeur monétaire arbitraire. Présente-la dans une section distincte.

Données fictives de démonstration

Préremplis le prototype avec un scénario réaliste mais clairement identifié comme fictif :

Micro-entreprise :

- activité libérale BNC ;
- TJM de 600 € ;
- rythme de quatre jours par semaine ;
- cinq semaines sans activité ;
- quelques jours non facturés consacrés à l’administratif.

Salariat :

- salaire exprimé en brut annuel équivalent temps plein ;
- activité à 80 % ;
- cinq semaines de congés payés ;
- une semaine de RTT ;
- participation annuelle ;
- tickets-restaurant.

Les résultats peuvent être simulés. Leur exactitude fiscale n’est pas demandée à ce stade : ils servent uniquement à évaluer l’interface.

Direction artistique

Je souhaite une interface :

- moderne, claire et rassurante ;
- sobre, mais pas froide ou institutionnelle ;
- proche de la qualité visuelle des produits conçus avec Lovable ;
- très lisible sur mobile ;
- avec beaucoup d’espace et une hiérarchie typographique forte ;
- accessible, avec de bons contrastes ;
- sans aspect tableur ;
- sans surcharge de cartes ou de bordures ;
- sans grands dégradés violets typiques des interfaces générées automatiquement.

Utilise une couleur distincte mais équilibrée pour chaque statut :

- vert profond ou turquoise pour la micro-entreprise ;
- bleu pour le salariat ;
- orange uniquement pour les avertissements ou points d’attention.

Les couleurs ne doivent jamais être le seul moyen de distinguer les informations.

Utilise des libellés et textes d’aide réalistes en français. Les montants doivent respecter le format français.

Contraintes

- Responsive mobile et ordinateur.
- Navigation entièrement fonctionnelle.
- Aucun compte utilisateur.
- Aucun stockage distant.
- Aucun backend.
- Aucune intégration Supabase.
- Aucune prétention à fournir un calcul fiscal exact.
- Ne pas choisir de nom de marque définitif.
- Ne pas consacrer de temps à une landing page marketing.
- Concentrer le travail sur le simulateur et la compréhension des résultats.

Le livrable doit être un prototype haute fidélité suffisamment interactif pour tester le parcours, modifier quelques valeurs fictives et juger la clarté de la comparaison.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://tout-compte-fait.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3de5378c-414f-494b-9126-e45e04db80ab).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
