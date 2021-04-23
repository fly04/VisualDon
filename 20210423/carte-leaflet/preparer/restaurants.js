const data = require('./sion.json')

const result = data.features
  .filter(d => d.geometry.type === 'Point' && d.properties.amenity === 'restaurant')
  .map(d => d.geometry.coordinates)

console.log(
  JSON.stringify(
    result
  )
)