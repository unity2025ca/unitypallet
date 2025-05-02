import { useState } from "react";
import translations from "@/lib/i18n";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqItems?: FaqItem[];
}

const FaqAccordion = ({ faqItems = translations.faq.questions }: FaqAccordionProps) => {
  return (
    <div className="max-w-3xl mx-auto">
      <Accordion type="single" collapsible className="space-y-4">
        {faqItems.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <AccordionTrigger className="flex justify-between items-center w-full p-4 text-right bg-gray-50 hover:bg-gray-100 transition text-lg font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="p-4 bg-white border-t border-gray-200">
              <p className="text-gray-600">{faq.answer}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FaqAccordion;
