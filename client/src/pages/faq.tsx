import { useState, useEffect } from "react";
import translations from "@/lib/i18n-temp";
import FaqAccordion from "@/components/shared/FaqAccordion";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Faq } from "@shared/schema";

const FaqPage = () => {
  // Fetch FAQs from API
  const { data: faqItems, isLoading, error } = useQuery<Faq[]>({
    queryKey: ['/api/faqs'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Map FAQs to the format expected by FaqAccordion when data is available
  const formattedFaqItems = faqItems?.map((faq: Faq) => ({
    question: faq.question,
    answer: faq.answer
  })) || [];

  // Show fallback content if no FAQs found in the database
  const displayFaqItems = formattedFaqItems.length > 0 
    ? formattedFaqItems 
    : translations.faq.questions;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark font-tajawal">
            {translations.faq.title}
          </h2>
          <p className="mt-4 text-neutral-medium max-w-2xl mx-auto">
            {translations.faq.subtitle}
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Could not load FAQs. Using default questions.</p>
            <FaqAccordion faqItems={translations.faq.questions} />
          </div>
        ) : (
          <FaqAccordion faqItems={displayFaqItems} />
        )}
      </div>
    </section>
  );
};

export default FaqPage;
