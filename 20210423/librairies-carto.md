# Exercice 3

## Pourquoi doit-on projeter des données cartographiques?

Pour pouvoir représenter une surface sphérique (la Terre) sur une surface plane (notre visualisation de données). 

## Qu'est ce qu'Open street map?

Open Street Map est une base de données géographique que l'on peut utiliser pour récupérer toutes sortes de données à utiliser dans nos visualisations de données dans différents formats.

## Quelles fonctions D3 sont spécifiques à la cartographie?

### d3.geoPath()

→ La fonction crée un élément `path` avec une projection spécifique si elle est spécifiée dans les paramètres.

### d3.geoMercator()

→ La fonction permet de créer une projection de Mercator.

### d3.geoGraticule()

→ La fonction permet de créer une graticule (sorte de carte sphérique).

### d3.geoTransform()

→ La fonction 

## À quoi sert le format topojson? En quoi est-il différent du geojson?

C'est un format similaire à geoJson qui représente des données géographiques, excepté qu'il prend moins de place.

## À quoi sert turf? Décrivez ce que font trois fonctions de cette libraire

C'est une librairie similaire à D3.

`distance()` → calcule la distance entre deux points

`circle()` → calcule un cercle à partir d'un point donné

`union()` → crée un polygone à partir deux autres polygones