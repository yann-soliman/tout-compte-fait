# Recherche fiscale — 2026-10-05

## Décisions et preuves

Le barème 2026 porte sur les revenus2025 ; projection des revenus2026 à référence constante, jamais barème2027 adopté.[1]
Tranches 11 600 / 29 579 / 84 577 / 181 917 € et taux0/11/30/41/45 % ; parts standard et plafond1 807 €/demi-part ; décote897 € célibataire ou1 483 € couple moins45,25 % de l'impôt. Base, impôt et décote à l'euro le plus proche.[2]
Salaire déclaré avant forfait10 % ; minimum509 € limité au salaire, maximum14 555 €/personne.[3]
Micro BNC : abattement34 %, minimum305 € limité aux recettes ; aucun frais réel supplémentaire.[4]
Seuil de recouvrement61 € strictement inférieur : pas d'impôt dû hors autres taxes/crédits exclus ici.[5]
EI : seule CSG déductible retire de la base ; CSG restante et CRDS sont non déductibles, donc réintégrées au net avant mutuelle.[6]
Salaire : CSG non déductible2,4 % et CRDS0,5 % réintégrées à la paie nette ; employer health/avantages imposables non modélisés, override net imposable de paie disponible.[7]

Sources HTML et PDF téléchargées réellement dans scratch/tcf-008-research, textes extraits pypdf hors dépôt. Le site economie.gouv est protégé par Cloudflare ; DGFiP et ServicePublic accessibles directement sans contournement. Aucun backend fiscal.

## Alternatives

Rejet : IR égal cash×taux, confusion salaire net/imposable, tauxPAS ou allocation de tout l'impôt du conjoint. Rejet : inventer barème2027. Modèle fiscal généraliste dépasse le périmètre ; foyer simple et blocages honnêtes plutôt que fausse précision. Référence sans activité et avec activité calculées identiquement, delta d'IR attribué à l'activité ; avantages et cash du conjoint exclus.

## Oracles prévus

Table DGFiP pages373–378 : célibataire30k=>2104 ; célibataire50k=>8104 et1enfant=>6297 ; couple50k=>2799, couple100k=>16208. Comparer plus largement à table et/ou simulateur DGFiP avant livraison. Attention tables décrivent l'impôt avant crédits et peuvent afficher des montants sous61 € : tests distinguent liquidation et recouvrement.

Hauts revenus : le seuil CEHR est fondé sur le RFR (250 000 € célibataire / 500 000 € couple). Le contrôle sur base totale de cette projection est conservateur et ne calcule pas un RFR complet ; les revenus RFR-only restent exclus du périmètre.[8]

## Sources

[1] https://www.service-public.gouv.fr/particuliers/vosdroits/F1419
[2] https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/21-calcul_impot_369a382.pdf
[3] https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/06-traitements_salaires_85a114.pdf
[4] https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/11-revenus_non_salaries_161a182.pdf
[5] https://bofip.impots.gouv.fr/bofip/2496-PGP.html/identifiant=BOI-IR-LIQ-20-20-40-20180704
[6] https://bofip.impots.gouv.fr/bofip/4635-PGP.html/identifiant=BOI-BNC-BASE-40-60-20-20150401
[7] https://www.service-public.gouv.fr/particuliers/vosdroits/F2971

[8] https://www.service-public.gouv.fr/particuliers/vosdroits/F31130
