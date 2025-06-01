import { ChromaticityDiagram } from "./chromaticityDiagram";
export type { ChromaticityDiagramProps } from "./chromaticityDiagram";
export {
  ChromaticityProvider,
  useChromaticity,
  type ColorSpace,
} from "./context";

// Export ChromaticityDiagram as both named and default export
export { ChromaticityDiagram };
export default ChromaticityDiagram;
