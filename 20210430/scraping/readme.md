# Exercice 1

J'ai utilisé le code ci-dessous pour récupérer les données demandées dans la console en m'inspirant de l'exemple n°1. J'ai choisi cette approche car elle m'a semblé être la plus adaptée à un exercice sans grande complexité technique comme celui-ci en étant la méthode la plus "légère" (pas de libraires).

```javascript
var cl = (el, tag) => Array.from(el.querySelectorAll(tag))

cl(temp1, "div.thumbnail")
  .map(el => {
    let title = el.querySelectorAll("a.title")[0].textContent;
    let price = el.querySelectorAll("h4.price")[0].textContent;
    let rating = el.querySelectorAll("p[data-rating]")[0].getAttribute('data-rating');
    
    return {
        title: title,
        price: price,
        rating: rating
    }
  })
```

