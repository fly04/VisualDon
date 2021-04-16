const xlsx = require('xlsx');

const file = xlsx.readFile('peinaussteiger2018.xlsx')
const json = xlsx.utils.sheet_to_json(file.Sheets['data']);



const filtre = d => d.Kanton === 'VD' && d.DTV_2018 > 10000;
const data = json
    .filter(filtre)
    .map(d => ({ville: d.Bahnhof_Haltestelle, nbVoyageurs: d.DTV_2018}))
    .sort((a, b) => a.nbVoyageurs > b.nbVoyageurs ? -1 : 1);

console.log(JSON.stringify(data));
