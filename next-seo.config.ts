import { DefaultSeoProps } from "next-seo";

const config: DefaultSeoProps = {
  titleTemplate: "%s | Excel Visualizer",
  defaultTitle: "Excel Visualizer",
  description:
    "Upload spreadsheets, clean data, and generate AI-driven charts with beautiful visualizations that tell your data’s story.",
  openGraph: {
    type: "website",
    url: "https://example.com",
    title: "Excel Visualizer",
    description:
      "Upload spreadsheets, clean data, and generate AI-driven charts with beautiful visualizations that tell your data’s story.",
    images: [
      {
        url: "https://dummyimage.com/1200x630/0b0b0f/e6e6eb&text=Excel+Visualizer",
        width: 1200,
        height: 630,
        alt: "Excel Visualizer",
      },
    ],
  },
  twitter: {
    cardType: "summary_large_image",
  },
};

export default config;

