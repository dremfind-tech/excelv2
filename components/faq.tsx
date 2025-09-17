import { Accordion, AccordionItem } from "@/components/ui/accordion";

export function FAQ() {
  return (
    <section id="faq" className="container-section">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
      <Accordion>
        <AccordionItem title="What file formats are supported?">XLSX, CSV, TSV. More coming soon.</AccordionItem>
        <AccordionItem title="How big can uploads be?">Up to 100MB per file on Free; higher on paid tiers.</AccordionItem>
        <AccordionItem title="Is my data private?">Yes. Data is encrypted at rest and in transit.</AccordionItem>
        <AccordionItem title="Can I export charts?">PNG, SVG, CSV, and PDF exports are available.</AccordionItem>
        <AccordionItem title="What support do you offer?">Community support for Free; 24/7 for Enterprise.</AccordionItem>
      </Accordion>
    </section>
  );
}
