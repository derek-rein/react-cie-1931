import type { Meta as ComponentMeta, StoryObj } from "@storybook/react";
import { ChromaticityDiagram } from "../chromaticityDiagram";
import { PrimariesData, whitepoints } from "../constants/primaries";

const meta: ComponentMeta<typeof ChromaticityDiagram> = {
  title: "Components/ChromaticityDiagram",
  component: ChromaticityDiagram,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
The **ChromaticityDiagram** component visualizes the CIE 1931 color space chromaticity diagram. It allows you to display and compare different color spaces by specifying input and output primaries, as well as a whitepoint. The diagram is rendered using WebGL for the background gradient, Canvas for overlays like grids and color space triangles, and SVG for the spectral locus boundary.

### Key Features:
- **Input and Output Primaries**: Define color spaces by providing RGB coordinates for input and output primaries. Use predefined color spaces like sRGB, Rec.709, or DCI-P3 from the provided constants or pass custom coordinates.
- **Whitepoint**: Specify a whitepoint to mark on the diagram, with predefined options like D65 or DCI, or use custom coordinates.
- **Customization**: Adjust the scale of the x and y axes, and customize colors for axis labels, grid lines, and primaries triangles.
- **Interactive Controls**: Use Storybook controls to dynamically change properties and see the effect on the diagram.

### Usage:
To use the ChromaticityDiagram component, pass the necessary props to define the color spaces and appearance. Here's an example with the default values as seen in the component definition:

\`\`\`jsx
import { ChromaticityDiagram } from 'react-cie-1931';

<ChromaticityDiagram
  inputPrimaries={{ r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06] }} // sRGB defaults
  outputPrimaries={{ r: [0.64, 0.33], g: [0.3, 0.6], b: [0.15, 0.06] }} // sRGB defaults
  whitepoint={{ x: 0.3127, y: 0.329 }} // Default to D65 coordinates
  xScale={0.8} // Default X scale (max x value)
  yScale={0.9} // Default Y scale (max y value)
  axisLabelColor="#000000" // Default axis label color
  gridLineColor="rgba(0, 0, 0, 0.2)" // Default grid line color
  gridLineWidth={1} // Default grid line width
  inputPrimariesColor="rgba(0, 255, 0, 0.8)" // Default input primaries stroke color
  outputPrimariesColor="rgba(255, 0, 0, 0.8)" // Default output primaries stroke color
/>
\`\`\`

Use the controls below to experiment with different settings. Note that the component uses default values for all parameters, as shown in the example above, which can be overridden by passing specific props.
        `,
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    inputPrimaries: {
      control: { type: "select" },
      options: ["None", ...Object.keys(PrimariesData)],
      mapping: {
        None: null,
        ...Object.fromEntries(
          Object.entries(PrimariesData).map(([key, primaries]) => [
            key,
            {
              r: [primaries[0].x, primaries[0].y],
              g: [primaries[1].x, primaries[1].y],
              b: [primaries[2].x, primaries[2].y],
            },
          ])
        ),
      },
      defaultValue: "sRGB",
      description:
        "Input color space primaries as RGB coordinates (x, y for red, green, blue). Select from predefined color spaces or set to 'None' to hide. Defaults to sRGB.",
    },
    outputPrimaries: {
      control: { type: "select" },
      options: ["None", ...Object.keys(PrimariesData)],
      mapping: {
        None: null,
        ...Object.fromEntries(
          Object.entries(PrimariesData).map(([key, primaries]) => [
            key,
            {
              r: [primaries[0].x, primaries[0].y],
              g: [primaries[1].x, primaries[1].y],
              b: [primaries[2].x, primaries[2].y],
            },
          ])
        ),
      },
      defaultValue: "sRGB",
      description:
        "Output color space primaries as RGB coordinates (x, y for red, green, blue). Select from predefined color spaces or set to 'None' to hide. Defaults to sRGB.",
    },
    whitepoint: {
      control: { type: "select" },
      options: ["None", ...Object.keys(whitepoints)],
      mapping: {
        None: null,
        ...Object.fromEntries(
          Object.entries(whitepoints).map(([name, coords]) => [
            name,
            { x: coords[0], y: coords[1] },
          ])
        ),
      },
      defaultValue: "D65",
      description:
        "Whitepoint coordinates (x, y) to display on the diagram. Select from predefined options or set to 'None' to hide. Defaults to D65.",
    },
    xScale: {
      control: { type: "number", min: 0.1, max: 1.0, step: 0.05 },
      defaultValue: 0.8,
      description:
        "Maximum x value for scaling the diagram (0.1 to 1.0). Defaults to 0.8.",
    },
    yScale: {
      control: { type: "number", min: 0.1, max: 1.0, step: 0.05 },
      defaultValue: 0.9,
      description:
        "Maximum y value for scaling the diagram (0.1 to 1.0). Defaults to 0.9.",
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
    inputPrimariesColor: {
      control: { type: "color" },
      defaultValue: "rgba(0, 255, 0, 0.8)",
      description:
        "Stroke color for the input primaries triangle. Defaults to 'rgba(0, 255, 0, 0.8)'.",
    },
    outputPrimariesColor: {
      control: { type: "color" },
      defaultValue: "rgba(255, 0, 0, 0.8)",
      description:
        "Stroke color for the output primaries triangle. Defaults to 'rgba(255, 0, 0, 0.8)'.",
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
      control: { type: "radio" }, // Or 'select'
      options: ["srgb", "display-p3"],
      defaultValue: "srgb",
      description:
        "Target rendering color space. 'srgb' or 'display-p3'. Defaults to 'srgb'. If 'display-p3' is selected, the component will attempt to use a WebGL2 context with P3 color space, falling back to sRGB if not supported.",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    inputPrimaries: "sRGB",
    outputPrimaries: "sRGB",
    whitepoint: "D65",
    xScale: 0.8,
    yScale: 0.9,
    showPlanckianLocus: true,
    planckianLocusColor: "#333333",
    colorSpace: "srgb",
  },
  name: "Default (sRGB)",
  parameters: {
    docs: {
      description: {
        story:
          "Displays the sRGB color space for both input and output primaries with the D65 whitepoint, using the component's default values.",
      },
    },
  },
};

export const Rec709_DCI: Story = {
  args: {
    inputPrimaries: "Rec.709",
    outputPrimaries: "DCI-P3",
    whitepoint: "DCI",
    xScale: 0.8,
    yScale: 0.9,
    inputPrimariesColor: "rgba(0, 0, 255, 0.4)",
    outputPrimariesColor: "rgba(255, 255, 0, 0.6)",
  },
  name: "Rec.709 vs DCI-P3",
  parameters: {
    docs: {
      description: {
        story:
          "Compares the Rec.709 and DCI-P3 color spaces with the DCI whitepoint, using distinct colors for each triangle to differentiate them.",
      },
    },
  },
};

export const NoWhitepoint: Story = {
  args: {
    inputPrimaries: "sRGB",
    outputPrimaries: "sRGB",
    whitepoint: "None",
    xScale: 0.8,
    yScale: 0.9,
  },
  name: "No Whitepoint",
  parameters: {
    docs: {
      description: {
        story:
          "Displays the sRGB color space for both input and output without a whitepoint marker, showing how to hide the whitepoint.",
      },
    },
  },
};
