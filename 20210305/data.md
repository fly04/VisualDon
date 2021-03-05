# Exercice 3

Dans le but de préparer un jeu de donnée destiné à être utilisées dans un graphique en bâtons, j'ai réalisé un fichier un fichier "`prepSolaire.js` qui va préparer les données et les exporter dans un fichier JSON.



J'ai commencé par récupérer les données du fichier initial fourni (renommé `solaire.json`) :

```javascript
const data = require('./solaire.json')
```

Ensuite j'ai choisi de récupérer uniquement les villes :

- En suisse
- Dans le canton de Vaud
- Ayant un potentiel énergétique solaire de plus de 50GWh avec les toits seulement

```javascript
const villes = d => d.Country === 'CH' && d.Canton === 'Vaud' && d.Scenario1_RoofsOnly_PotentialSolarElectricity_GWh >= 50
```

J'ai ensuite trié le tableau pour garder que les données qui m'intéressent et des alias pour avoir des noms plus parlants, puis finalement ordonné par potentiel énergétique.

```javascript
const resultat = data
  .filter(villes)
  .map(d => ({ nom: d.MunicipalityName, potentielSolaire: d.Scenario1_RoofsOnly_PotentialSolarElectricity_GWh }))
  .sort((a, b) => a.potentielSolaire > b.potentielSolaire ? -1 : 1)
```

Finalement j'ai exporté le résultat dans un fichier JSON à l'aide de :

```javascript
console.log(JSON.stringify(resultat));
```

ainsi que la commande `node prepSolaire > dataSolaire.json`.

