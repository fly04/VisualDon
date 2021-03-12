# Exercice 3 - Transitions



### Comment fonctionnent les transitions en D3 et en svelte?

**D3**

Il faut utiliser certaines méthodes sur l'élément sur lequel on veut appliquer la transition. Les méthodes utilisées sont :

- `.transition()` qui permet de lancer la transition
- `.duration()` qui permet de déterminer la durée
- `.attr()` qui permet de modifier un attribut de l'élément affecté par la transition

```javascript
monElement
	.transition()
	.duration(1000)	//la transition dure une seconde (1000ms)
	.attr('fill', 'red')	//passera de sa couleur de base à du rouge
```

Il ne faut pas oublier d'ensuite appeler notre transition, par exemple suite à un événement.



**Svelte**

Il faut ajouter un attribut `transform` sur l'élément sur lequel on veut appliquer notre transition. 

```javascript
 <g transform={`translate(${MARGIN / 2}, 0)`}>
    {#each DATA as d, i}
      <Baton d={d} i={i} key={key} />
    {/each}
  </g>
```

