import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
  HueSaturation,
  BrightnessContrast,
  N8AO,
} from '@react-three/postprocessing'
import { BLOOM_INTENSITY_DAY, BLOOM_INTENSITY_NIGHT, BLOOM_INTENSITY_RAIN } from '../config.js'

export default function Effects({ mode }) {
  const bloom =
    mode === 'night' ? BLOOM_INTENSITY_NIGHT : mode === 'rain' ? BLOOM_INTENSITY_RAIN : BLOOM_INTENSITY_DAY

  return (
    <EffectComposer>
      <N8AO halfRes aoRadius={14} intensity={2.2} distanceFalloff={2.5} />
      <Bloom
        mipmapBlur
        intensity={bloom}
        luminanceThreshold={mode === 'night' ? 0.18 : 0.85}
        luminanceSmoothing={0.2}
      />
      <DepthOfField target={[0, 4, 0]} focalLength={0.045} bokehScale={2.2} height={480} />
      <HueSaturation saturation={0.12} />
      <BrightnessContrast brightness={0.015} contrast={0.06} />
      <Vignette eskil={false} offset={0.22} darkness={mode === 'night' ? 0.62 : 0.5} />
    </EffectComposer>
  )
}
