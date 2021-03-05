import {
  axisLeft,
  select,
  scaleLinear,
  max
} from 'd3'

const DATA = [{ "nom": "Lausanne", "potentielSolaire": 326.86 }, { "nom": "Yverdon-les-Bains", "potentielSolaire": 125.72 }, { "nom": "Ollon", "potentielSolaire": 79.59 }, { "nom": "Ecublens (VD)", "potentielSolaire": 79.54 }, { "nom": "Montreux", "potentielSolaire": 75.73 }, { "nom": "Payerne", "potentielSolaire": 74.89 }, { "nom": "Aigle", "potentielSolaire": 72.88 }, { "nom": "Nyon", "potentielSolaire": 67.97 }, { "nom": "Renens (VD)", "potentielSolaire": 61.96 }, { "nom": "Crissier", "potentielSolaire": 60.69 }, { "nom": "Le Mont-sur-Lausanne", "potentielSolaire": 60.32 }, { "nom": "Bex", "potentielSolaire": 59.14 }, { "nom": "Pully", "potentielSolaire": 56.78 }, { "nom": "Ch├óteau-d'Oex", "potentielSolaire": 56.08 }, { "nom": "Gland", "potentielSolaire": 53.05 }, { "nom": "Oron", "potentielSolaire": 52.28 }, { "nom": "Morges", "potentielSolaire": 50.22 }]


console.log(DATA);
const WIDTH = 1000;
const HEIGHT = 500;
const MARGIN = 5;
const MARGIN_LEFT = 50;
const MARGIN_BOTTOM = 50;
const BAR_WIDTH = (WIDTH - MARGIN_LEFT) / DATA.length;

const svg = select('body')
  .append('svg')
  .attr('viewBox', `0 0 ${WIDTH} ${HEIGHT}`)

const yScale = scaleLinear()
  .domain([0, max(DATA, d => d.potentielSolaire)])
  .range([HEIGHT - MARGIN_BOTTOM, 0])

const group = svg.append('g')
  .attr('transform', `translate(${MARGIN_LEFT}, 0)`)

group.selectAll('rect')
  .data(DATA)
  .enter()
  .append('rect')
  .attr('x', (d, i) => i * BAR_WIDTH)
  .attr('width', BAR_WIDTH - MARGIN)
  .attr('y', d => yScale(d.potentielSolaire))
  .attr('height', d => HEIGHT - MARGIN_BOTTOM - yScale(d.potentielSolaire))
  .attr('fill', 'steelblue');

group.selectAll('text')
  .data(DATA)
  .enter()
  .append('text')
  .text(d => d.nom)
  .attr('x', (d, i) => i * BAR_WIDTH + BAR_WIDTH / 2)
  .attr('y', HEIGHT - MARGIN_BOTTOM / 2)
  .attr('text-anchor', 'middle')
  .attr('font-size', '9px')

const axisY = axisLeft().scale(yScale)
  .tickFormat(d => `${d / 1000}k`)
  .ticks(5)

svg.append('g')
  .attr('transform', `translate(${MARGIN_LEFT - 3})`)
  .call(axisY)