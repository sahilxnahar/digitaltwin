import { Text } from '@react-three/drei'
import { CITY_CFG } from '../config.js'
import { ROAD_XS, ROAD_ZS } from '../paths.js'

// Street names painted flat onto the asphalt of the micro scene,
// Google-Maps style — data-driven per city from src/cities.js.
const LABEL_SPOTS = [-90, 60] // two label positions along each road

export default function StreetLabels() {
  const labels = []
  for (const x of ROAD_XS) {
    const name = CITY_CFG.roadNamesX[String(x)]
    if (!name) continue
    for (const s of LABEL_SPOTS) labels.push({ pos: [x, 0.09, s], rotZ: Math.PI / 2, text: name })
  }
  for (const z of ROAD_ZS) {
    const name = CITY_CFG.roadNamesZ[String(z)]
    if (!name) continue
    for (const s of LABEL_SPOTS) labels.push({ pos: [s, 0.09, z], rotZ: 0, text: name })
  }
  return (
    <group>
      {labels.map((l, i) => (
        <Text
          key={i}
          position={l.pos}
          rotation={[-Math.PI / 2, 0, l.rotZ]}
          fontSize={3.2}
          color="#b9c2cc"
          fillOpacity={0.8}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
          maxWidth={110}
        >
          {l.text}
        </Text>
      ))}
    </group>
  )
}
