import React from "react";
import type { ChromaticityDiagramProps } from "./chromaticityDiagram";
import { ChromaticityDiagram as ChromaticityDiagramBase } from "./chromaticityDiagram";
import { ChromaticityProvider } from "./context";

export type { ChromaticityDiagramProps } from "./chromaticityDiagram";

// Create a wrapped component that includes the provider
export const ChromaticityDiagram: React.FC<ChromaticityDiagramProps> = (
  props
) => {
  return (
    <ChromaticityProvider>
      <ChromaticityDiagramBase {...props} />
    </ChromaticityProvider>
  );
};

// Export as default for convenience
export default ChromaticityDiagram;
