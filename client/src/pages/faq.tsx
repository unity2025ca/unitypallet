import translations from "@/lib/i18n";
import FaqAccordion from "@/components/shared/FaqAccordion";

const FaqPage = () => {
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
        
        <FaqAccordion faqItems={translations.faq.questions} />
      </div>
    </section>
  );
};

export default FaqPage;
