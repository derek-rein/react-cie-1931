import type { Meta as ComponentMeta, StoryObj } from "@storybook/react";
import { ChromaticityDiagram } from "../chromaticityDiagram";
import { PrimariesData, whitepoints } from "../constants/primaries";

const meta: ComponentMeta<typeof ChromaticityDiagram> = {
  title: "Components/ChromaticityDiagram",
  component: ChromaticityDiagram,
  parameters: {
    layout: "centered",
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
    },
    xScale: {
      control: { type: "number", min: 0.1, max: 1.0, step: 0.05 },
      defaultValue: 0.8,
    },
    yScale: {
      control: { type: "number", min: 0.1, max: 1.0, step: 0.05 },
      defaultValue: 1,
    },
    axisLabelColor: {
      control: { type: "color" },
      defaultValue: "#000000",
    },
    gridLineColor: {
      control: { type: "color" },
      defaultValue: "rgba(0, 0, 0, 0.2)",
    },
    gridLineWidth: {
      control: { type: "number", min: 0.5, max: 5, step: 0.5 },
      defaultValue: 1,
    },
    inputPrimariesColor: {
      control: { type: "color" },
      defaultValue: "rgba(0, 255, 0, 0.8)",
    },
    outputPrimariesColor: {
      control: { type: "color" },
      defaultValue: "rgba(255, 0, 0, 0.8)",
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
};

export const NoWhitepoint: Story = {
  args: {
    inputPrimaries: "sRGB",
    outputPrimaries: "sRGB",
    whitepoint: "None",
    xScale: 0.8,
    yScale: 0.9,
  },
};
