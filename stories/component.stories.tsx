import type { Meta as ComponentMeta, StoryObj } from "@storybook/react-vite";
import React from "react";
import type { ColorSpace } from "../src/context";
import { ChromaticityDiagram } from "../src/index";
import { colorspaces } from "./data";

// Helper function to find a color space by name
const findColorSpace = (name: string): ColorSpace | null => {
  const found = colorspaces.find((cs) => cs.name === name);
  return found || null;
};

// Helper to create a color space option with fallback
const createColorSpaceOption = (
  name: string,
  displayName?: string,
  color?: string
): ColorSpace => {
  const found = findColorSpace(name);
  if (!found) {
    throw new Error(`Color space "${name}" not found in data`);
  }
  return {
    ...found,
    name: displayName || found.name,
    color,
  };
};

// Predefined color spaces using data from stories/data.ts
const colorSpaceOptions = {
  sRGB: createColorSpaceOption("sRGB", undefined, "rgba(0, 255, 0, 0.8)"),
  "DCI-P3": createColorSpaceOption("DCI-P3", undefined, "rgba(255, 0, 0, 0.8)"),
  "Rec.2020": createColorSpaceOption(
    "ITU-R BT.2020",
    "Rec.2020",
    "rgba(255, 255, 0, 0.8)"
  ),
  "Adobe RGB": createColorSpaceOption(
    "Adobe RGB (1998)",
    "Adobe RGB",
    "rgba(255, 0, 255, 0.8)"
  ),
  ACEScg: createColorSpaceOption("ACEScg", undefined, "rgba(0, 255, 255, 0.8)"),
  "ACES2065-1": createColorSpaceOption(
    "ACES2065-1",
    undefined,
    "rgba(128, 255, 128, 0.8)"
  ),
};

// Available color space options for dropdowns
const colorSpaceDropdownOptions = [
  "None",
  ...Object.keys(colorSpaceOptions),
] as const;
type ColorSpaceOption = (typeof colorSpaceDropdownOptions)[number];

// Component wrapper that handles color space selection logic
const ChromaticityDiagramWrapper: React.FC<{
  colorSpace1?: ColorSpaceOption;
  colorSpace1Color?: string;
  colorSpace2?: ColorSpaceOption;
  colorSpace2Color?: string;
  colorSpace3?: ColorSpaceOption;
  colorSpace3Color?: string;
  showPlanckianLocus?: boolean;
  planckianLocusColor?: string;
  colorSpace?: "srgb" | "display-p3";
  axisLabelColor?: string;
  gridLineColor?: string;
  gridLineWidth?: number;
}> = ({
  colorSpace1 = "None",
  colorSpace1Color = "rgba(0, 255, 0, 0.8)",
  colorSpace2 = "None",
  colorSpace2Color = "rgba(255, 0, 0, 0.8)",
  colorSpace3 = "None",
  colorSpace3Color = "rgba(0, 0, 255, 0.8)",
  ...props
}) => {
  // Convert the individual selections into a colorSpaces array
  const colorSpaces: ColorSpace[] = [
    colorSpace1 !== "None"
      ? {
          ...colorSpaceOptions[colorSpace1 as keyof typeof colorSpaceOptions],
          color: colorSpace1Color,
        }
      : null,
    colorSpace2 !== "None"
      ? {
          ...colorSpaceOptions[colorSpace2 as keyof typeof colorSpaceOptions],
          color: colorSpace2Color,
        }
      : null,
    colorSpace3 !== "None"
      ? {
          ...colorSpaceOptions[colorSpace3 as keyof typeof colorSpaceOptions],
          color: colorSpace3Color,
        }
      : null,
  ].filter(Boolean) as ColorSpace[];

  return <ChromaticityDiagram {...props} colorSpaces={colorSpaces} />;
};

const meta: ComponentMeta<typeof ChromaticityDiagramWrapper> = {
  title: "Components/ChromaticityDiagram",
  component: ChromaticityDiagramWrapper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The **ChromaticityDiagram** component visualizes the CIE 1931 color space chromaticity diagram with a modern, context-based architecture. It displays multiple color spaces simultaneously with their respective triangles and white points. The diagram uses WebGL for the background gradient, with synchronized zoom and pan functionality.

### Key Features:
- **Multiple Color Spaces**: Display up to 3 color spaces simultaneously using the color space selection controls
- **Context-Based Architecture**: Uses React Context for clean state management and eliminates useEffect synchronization issues
- **Auto-Provider Integration**: The component automatically wraps itself with ChromaticityProvider - no manual setup required
- **Fixed Internal Scaling**: Uses optimized internal scales (x: 0.8, y: 0.9) - no longer exposed as props
- **Synchronized Rendering**: WebGL shader viewport perfectly synchronized with zoom/pan state
- **Professional Interaction**: Smooth pan/zoom with mouse, wheel, touch, and control buttons
- **Easy Selection**: Use dropdown controls to select from predefined color spaces or set to "None"

### Usage in Storybook:
Use the **Controls** panel to:
- Select up to 3 color spaces from the dropdown menus
- Set any slot to "None" to disable that color space
- Adjust visual properties like grid lines, axes, and Planckian locus
- Switch between sRGB and Display P3 rendering

### Programmatic API:
\`\`\`jsx
import { ChromaticityDiagram } from 'react-cie-1931';

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

// No manual provider needed - it's automatic!
<ChromaticityDiagram 
  colorSpaces={colorSpaces}
  showPlanckianLocus={true}
  colorSpace="srgb"
/>
\`\`\`

### Advanced Usage:
For advanced use cases where you need manual control over the provider, you can import \`ChromaticityDiagramBase\` and \`ChromaticityProvider\` separately.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    colorSpace1: {
      control: {
        type: "select",
      },
      options: colorSpaceDropdownOptions,
      description: "First color space to display on the diagram.",
      defaultValue: "None",
    },
    colorSpace1Color: {
      control: { type: "color" },
      defaultValue: "rgba(0, 255, 0, 0.8)",
      description:
        "Color for the first color space. Defaults to 'rgba(0, 255, 0, 0.8)'.",
    },
    colorSpace2: {
      control: {
        type: "select",
      },
      options: colorSpaceDropdownOptions,
      description: "Second color space to display on the diagram.",
      defaultValue: "None",
    },
    colorSpace2Color: {
      control: { type: "color" },
      defaultValue: "rgba(255, 0, 0, 0.8)",
      description:
        "Color for the second color space. Defaults to 'rgba(255, 0, 0, 0.8)'.",
    },
    colorSpace3: {
      control: {
        type: "select",
      },
      options: colorSpaceDropdownOptions,
      description: "Third color space to display on the diagram.",
      defaultValue: "None",
    },
    colorSpace3Color: {
      control: { type: "color" },
      defaultValue: "rgba(0, 0, 255, 0.8)",
      description:
        "Color for the third color space. Defaults to 'rgba(0, 0, 255, 0.8)'.",
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
    colorSpace1: "sRGB",
    colorSpace1Color: "rgba(0, 255, 0, 0.8)",
    colorSpace2: "None",
    colorSpace2Color: "rgba(255, 0, 0, 0.8)",
    colorSpace3: "None",
    colorSpace3Color: "rgba(0, 0, 255, 0.8)",
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
    colorSpace1: "sRGB",
    colorSpace1Color: "rgba(0, 255, 0, 0.8)",
    colorSpace2: "DCI-P3",
    colorSpace2Color: "rgba(255, 0, 0, 0.8)",
    colorSpace3: "Rec.2020",
    colorSpace3Color: "rgba(0, 0, 255, 0.8)",
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
    colorSpace1: "sRGB",
    colorSpace1Color: "rgba(0, 255, 0, 0.8)",
    colorSpace2: "Adobe RGB",
    colorSpace2Color: "rgba(255, 0, 255, 0.8)",
    colorSpace3: "ACEScg",
    colorSpace3Color: "rgba(0, 255, 255, 0.8)",
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
    colorSpace1: "sRGB",
    colorSpace1Color: "rgba(0, 255, 0, 0.8)",
    colorSpace2: "DCI-P3",
    colorSpace2Color: "rgba(255, 0, 0, 0.8)",
    colorSpace3: "None",
    colorSpace3Color: "rgba(0, 0, 255, 0.8)",
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
    colorSpace1: "sRGB",
    colorSpace1Color: "rgba(0, 255, 0, 0.8)",
    colorSpace2: "ACEScg",
    colorSpace2Color: "rgba(0, 255, 255, 0.8)",
    colorSpace3: "DCI-P3",
    colorSpace3Color: "rgba(255, 0, 0, 0.8)",
    showPlanckianLocus: true,
    planckianLocusColor: "#666666",
    colorSpace: "srgb",
  },
  name: "All Major Standards",
  parameters: {
    docs: {
      description: {
        story: "Shows major color space standards: sRGB, ACEScg, and DCI-P3.",
      },
    },
  },
};

export const Empty_Diagram: Story = {
  args: {
    colorSpace1: "None",
    colorSpace1Color: "rgba(0, 255, 0, 0.8)",
    colorSpace2: "None",
    colorSpace2Color: "rgba(255, 0, 0, 0.8)",
    colorSpace3: "None",
    colorSpace3Color: "rgba(0, 0, 255, 0.8)",
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
