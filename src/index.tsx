import { ChromaticityDiagram } from "./chromaticityDiagram";
export {
  ChromaticityProvider,
  useChromaticity,
  type ColorSpace,
} from "./ChromaticityContext";
export type { ChromaticityDiagramProps } from "./chromaticityDiagram";

// Export ChromaticityDiagram as both named and default export
export { ChromaticityDiagram };
export default ChromaticityDiagram;
