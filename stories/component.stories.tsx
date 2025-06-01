import type { Meta as ComponentMeta, StoryObj } from "@storybook/react";
import React from "react";
import { PrimariesData, whitepoints } from "../src/constants/primaries";
import {
  ChromaticityDiagram,
  ChromaticityProvider,
  type ColorSpace,
} from "../src/index";

// Helper to create ColorSpace objects from primaries data
const createColorSpace = (
  name: string,
  primariesKey: keyof typeof PrimariesData,
  whitepointKey: keyof typeof whitepoints,
  color?: string
): ColorSpace => {
  const primaries = PrimariesData[primariesKey];
  const whitepoint = whitepoints[whitepointKey];

  return {
    name,
    rgb: {
      r: [primaries[0].x, primaries[0].y],
      g: [primaries[1].x, primaries[1].y],
      b: [primaries[2].x, primaries[2].y],
    },
    whitepoint: {
      x: whitepoint[0],
      y: whitepoint[1],
    },
    color,
  };
};

// Predefined color spaces
const colorSpaceOptions = {
  sRGB: createColorSpace("sRGB", "sRGB", "D65", "rgba(0, 255, 0, 0.8)"),
  "DCI-P3": createColorSpace("DCI-P3", "P3", "DCI", "rgba(255, 0, 0, 0.8)"),
  "Rec.2020": createColorSpace(
    "Rec.2020",
    "Rec2020",
    "D65",
    "rgba(255, 255, 0, 0.8)"
  ),
  "Adobe RGB": createColorSpace(
    "Adobe RGB",
    "AdobeRGB",
    "D65",
    "rgba(255, 0, 255, 0.8)"
  ),
  ACEScg: createColorSpace("ACEScg", "ACEScg", "D60", "rgba(0, 255, 255, 0.8)"),
  "ACES2065-1": createColorSpace(
    "ACES2065-1",
    "ACES2065_1",
    "D60",
    "rgba(128, 255, 128, 0.8)"
  ),
};

// Component wrapper that includes the context provider
const ChromaticityDiagramWithProvider: React.FC<{
  colorSpaces: ColorSpace[];
  showPlanckianLocus?: boolean;
  planckianLocusColor?: string;
  colorSpace?: "srgb" | "display-p3";
  axisLabelColor?: string;
  gridLineColor?: string;
  gridLineWidth?: number;
}> = (props) => (
  <ChromaticityProvider>
    <ChromaticityDiagram {...props} />
  </ChromaticityProvider>
);

const meta: ComponentMeta<typeof ChromaticityDiagramWithProvider> = {
  title: "Components/ChromaticityDiagram",
  component: ChromaticityDiagramWithProvider,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The **ChromaticityDiagram** component visualizes the CIE 1931 color space chromaticity diagram with a modern, context-based architecture. It displays multiple color spaces simultaneously with their respective triangles and white points. The diagram uses WebGL for the background gradient, with synchronized zoom and pan functionality.

### Key Features:
- **Multiple Color Spaces**: Display any number of color spaces simultaneously using the \`colorSpaces\` array prop
- **Context-Based Architecture**: Uses React Context for clean state management and eliminates useEffect synchronization issues
- **Fixed Internal Scaling**: Uses optimized internal scales (x: 0.8, y: 0.9) - no longer exposed as props
- **Synchronized Rendering**: WebGL shader viewport perfectly synchronized with zoom/pan state
- **Professional Interaction**: Smooth pan/zoom with mouse, wheel, touch, and control buttons
- **Automatic Color Assignment**: Default colors assigned automatically, or specify custom colors per color space

### New API:
The component now accepts a \`colorSpaces\` array instead of individual \`inputPrimaries\` and \`outputPrimaries\`:

\`\`\`jsx
import { ChromaticityProvider, ChromaticityDiagram } from 'react-cie-1931';

const colorSpaces = [
  {
    name: "sRGB",
    rgb: {
      r: [0.64, 0.33],
      g: [0.3, 0.6], 
      b: [0.15, 0.06]
    },
    whitepoint: { x: 0.3127, y: 0.329 },
    color: "rgba(0, 255, 0, 0.8)" // optional
  },
  // Add more color spaces...
];

<ChromaticityProvider>
  <ChromaticityDiagram 
    colorSpaces={colorSpaces}
    showPlanckianLocus={true}
    colorSpace="srgb"
  />
</ChromaticityProvider>
\`\`\`

### Context Provider:
The component must be wrapped in a \`ChromaticityProvider\` to provide the rendering context and state management.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    colorSpaces: {
      control: { type: "object" },
      description:
        "Array of color spaces to display on the diagram. Each color space should have name, rgb primaries, whitepoint, and optional color.",
    },
    axisLabelColor: {
      control: { type: "color" },
      defaultValue: "#000000",
      description: "Color for the axis labels. Defaults to '#000000'.",
    },
    gridLineColor: {
      control: { type: "color" },
      defaultValue: "rgba(0, 0, 0, 0.2)",
      description:
        "Color for the grid lines. Defaults to 'rgba(0, 0, 0, 0.2)'.",
    },
    gridLineWidth: {
      control: { type: "number", min: 0.5, max: 5, step: 0.5 },
      defaultValue: 1,
      description: "Width for the grid lines (0.5 to 5). Defaults to 1.",
    },
    showPlanckianLocus: {
      control: { type: "boolean" },
      defaultValue: false,
      description:
        "Whether to show the Planckian locus (black body radiation curve). Defaults to false.",
    },
    planckianLocusColor: {
      control: { type: "color" },
      defaultValue: "#000000",
      description: "Color for the Planckian locus line. Defaults to '#000000'.",
    },
    colorSpace: {
      control: { type: "radio" },
      options: ["srgb", "display-p3"],
      defaultValue: "srgb",
      description:
        "Target rendering color space. 'srgb' or 'display-p3'. Defaults to 'srgb'.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    colorSpaces: [colorSpaceOptions.sRGB],
    showPlanckianLocus: false,
    colorSpace: "srgb",
  },
  name: "Default (sRGB)",
  parameters: {
    docs: {
      description: {
        story:
          "Displays a single sRGB color space with its triangle and white point.",
      },
    },
  },
};

export const Multiple_Color_Spaces: Story = {
  args: {
    colorSpaces: [
      colorSpaceOptions.sRGB,
      colorSpaceOptions["DCI-P3"],
      colorSpaceOptions["Rec.2020"],
    ],
    showPlanckianLocus: true,
    planckianLocusColor: "#333333",
    colorSpace: "srgb",
  },
  name: "Multiple Color Spaces",
  parameters: {
    docs: {
      description: {
        story:
          "Compares sRGB, DCI-P3, and Rec.2020 color spaces with the Planckian locus displayed.",
      },
    },
  },
};

export const Wide_Gamut_Comparison: Story = {
  args: {
    colorSpaces: [
      colorSpaceOptions.sRGB,
      colorSpaceOptions["Adobe RGB"],
      colorSpaceOptions.ACEScg,
    ],
    showPlanckianLocus: false,
    colorSpace: "srgb",
  },
  name: "Wide Gamut Comparison",
  parameters: {
    docs: {
      description: {
        story:
          "Compares sRGB with wide gamut color spaces Adobe RGB and ACEScg.",
      },
    },
  },
};

export const Display_P3_Rendering: Story = {
  args: {
    colorSpaces: [colorSpaceOptions.sRGB, colorSpaceOptions["DCI-P3"]],
    showPlanckianLocus: false,
    colorSpace: "display-p3",
  },
  name: "Display P3 Rendering",
  parameters: {
    docs: {
      description: {
        story:
          "Renders the diagram using Display P3 color space for more accurate colors on compatible displays.",
      },
    },
  },
};

export const All_Major_Standards: Story = {
  args: {
    colorSpaces: [
      colorSpaceOptions.sRGB,
      colorSpaceOptions.ACEScg,
      colorSpaceOptions["DCI-P3"],
      colorSpaceOptions["Rec.2020"],
    ],
    showPlanckianLocus: true,
    planckianLocusColor: "#666666",
    colorSpace: "srgb",
  },
  name: "All Major Standards",
  parameters: {
    docs: {
      description: {
        story:
          "Shows all major color space standards: sRGB, ACEScg, DCI-P3, and Rec.2020.",
      },
    },
  },
};

export const Empty_Diagram: Story = {
  args: {
    colorSpaces: [],
    showPlanckianLocus: true,
    planckianLocusColor: "#000000",
    colorSpace: "srgb",
  },
  name: "Empty Diagram",
  parameters: {
    docs: {
      description: {
        story:
          "Shows just the chromaticity diagram with Planckian locus and no color space triangles.",
      },
    },
  },
};
