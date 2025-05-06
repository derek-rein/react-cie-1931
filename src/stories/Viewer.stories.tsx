import type { Meta as ComponentMeta, StoryObj } from "@storybook/react";
import { ChromaticityDiagram } from "../chromaticityDiagram";

const meta: ComponentMeta<typeof ChromaticityDiagram> = {
	title: "Components/ChromaticityDiagram",
	component: ChromaticityDiagram,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	argTypes: {
		inputColorSpace: {
			control: { type: "select" },
			options: ["sRGB", "AdobeRGB", "P3", "Rec2020"],
			defaultValue: "sRGB",
		},
		outputColorSpace: {
			control: { type: "select" },
			options: ["sRGB", "AdobeRGB", "P3", "Rec2020"],
			defaultValue: "sRGB",
		},
		whitepoint: {
			control: { type: "select" },
			options: ["D50", "D55", "D60", "D65", "DCI"],
			defaultValue: "D65",
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		inputColorSpace: "sRGB",
		outputColorSpace: "sRGB",
		whitepoint: "D65",
	},
};
