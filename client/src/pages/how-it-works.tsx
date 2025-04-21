import translations from "@/lib/i18n";

const HowItWorksPage = () => {
  const steps = translations.howItWorks.steps;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark font-tajawal">
            {translations.howItWorks.title}
          </h2>
          <p className="mt-4 text-neutral-medium max-w-2xl mx-auto">
            {translations.howItWorks.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="relative">
                <div className={`w-20 h-20 flex items-center justify-center rounded-full ${
                  index === steps.length - 1 
                    ? "bg-[#F59E0B] text-white" 
                    : "bg-primary text-white"
                } text-2xl font-bold mb-4 shadow-lg`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute hidden md:block w-full h-1 bg-blue-200 top-10 -right-1/2 z-0"></div>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-3 font-tajawal">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-neutral-dark font-tajawal mb-4">
            {translations.howItWorks.explanation.title}
          </h3>
          <p className="text-gray-600 mb-4">
            {translations.howItWorks.explanation.description}
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {translations.howItWorks.explanation.types.map((type, index) => (
              <div key={index} className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 mt-1">
                  <i className="fas fa-check-circle text-secondary"></i>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{type.title}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPage;
