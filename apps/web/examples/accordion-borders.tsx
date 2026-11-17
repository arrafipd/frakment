"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const items = [
  {
    content:
      "We offer monthly and annual subscription plans. Billing is charged at the beginning of each cycle, and you can cancel anytime. All plans include automatic backups, 24/7 support, and unlimited team members.",
    trigger: "How does billing work?",
    value: "billing",
  },
  {
    content:
      "Yes. We use end-to-end encryption, SOC 2 Type II compliance, and regular third-party security audits. All data is encrypted at rest and in transit using industry-standard protocols.",
    trigger: "Is my data secure?",
    value: "security",
  },
  {
    content:
      "We integrate with 500+ popular tools including Slack, Zapier, Salesforce, HubSpot, and more. You can also build custom integrations using our REST API and webhooks.",
    trigger: "What integrations do you support?",
    value: "integration",
  },
];

export function AccordionBorders() {
  return (
    <Accordion
      className="w-full max-w-lg rounded-lg border"
      collapsible
      defaultValue="billing"
      type="single"
    >
      {items.map((item) => (
        <AccordionItem
          className="w-full border-b px-4 last:border-b-0"
          key={item.value}
          value={item.value}
        >
          <AccordionTrigger>{item.trigger}</AccordionTrigger>
          <AccordionContent>{item.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
