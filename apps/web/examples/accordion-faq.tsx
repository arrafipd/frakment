import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function AccordionFaq() {
  return (
    <Accordion className="w-full max-w-md" collapsible type="single">
      <AccordionItem value="ship">
        <AccordionTrigger>How do I ship Frakment in my app?</AccordionTrigger>
        <AccordionContent>
          Copy each primitive into your project with the CLI, then import from
          your local `components/ui` directory.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="update">
        <AccordionTrigger>How do updates work?</AccordionTrigger>
        <AccordionContent>
          {
            "Because every component is local, run `npx frakment add <name>` again and diff the result."
          }
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
