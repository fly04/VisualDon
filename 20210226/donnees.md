# Visual Don - Exercice 2

Le jeu de données choisi s'intitule *Statistics and Social Network of YouTube Videos*, plus particulièrement *Datasets of Normal Crawl*. Celui-ci est disponible à cette [adresse](http://netsg.cs.sfu.ca/youtubedata/).



**D'où viennent les données?**

Les données viennent directement de Youtube. En effet, le site a été parcouru pendant plusieurs mois par des robots. À partir de l'identifiant de chaque vidéo, la majorité des métadatas ont été récupérées via l'API de Youtube. Ensuite, les informations manquantes telles que par exemple la catégorie de la vidéo ou les vidéos connexes sont récupérées directement depuis la page de celle-ci.



**Qui a crée le jeu de données? Dans quel but?**

Le jeu de données a été crée par Xu Cheng, Cameron Dale et Jiangchuan Liu à la School of Computing Science, Simon Fraser University au Canada. 

Le jeu de données a été crée dans un but académique et peut servir à comprendre le fonctionnement de Youtube et du trafic qui s'y trouve.



**Qu'est-ce qu'elles représentent?**

Le jeu de données contient des informations concernant plus de 3 million de vidéos Youtube. On y trouve l'ID de la vidéo, le nom de l'utilisateur qui a uploadé la vidéo, l'âge de la vidéo, la catégorie, la durée, le nombre de vues, la notation, le nombre de commentaires et les identifiants des vidéos connexes.



**Quel est le format?**

Le format utilisé est .txt.



**Idées de visualisation**

Il est possible d'utiliser ces données pour visualiser les corrélations entre les différents paramètres, à l'aide par exemple de diagrammes en barre ayant un paramètre par axe (catégorie/nombre de vue, catégorie/nombre de vidéos) ou avec des nuages de points pour mettre en relation deux variables (nombre de vue/âge). 