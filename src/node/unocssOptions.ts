import { VitePluginConfig } from 'unocss/vite'
import { presetAttributify, presetWind3, presetIcons } from 'unocss'

const options: VitePluginConfig = {
  presets: [presetAttributify(), presetWind3({}), presetIcons()],
}

export default options
