import { useSettings } from "@/hooks/use-settings";
import { CheckCircle } from "lucide-react";

const HowItWorksPage = () => {
  const { getSettingValue } = useSettings();
  
  // Get page content from settings
  const title = getSettingValue("how_it_works_title", "How It Works?");
  const subtitle = getSettingValue("how_it_works_subtitle", "Simple steps to get Amazon return pallets");
  
  // Get steps content from settings
  const steps = [
    {
      title: getSettingValue("how_it_works_step1_title", "Choose a Pallet"),
      description: getSettingValue("how_it_works_step1_description", "Browse available pallets and choose what suits your needs and interests.")
    },
    {
      title: getSettingValue("how_it_works_step2_title", "Contact Us"),
      description: getSettingValue("how_it_works_step2_description", "Via WhatsApp or contact form to inquire and confirm your order.")
    },
    {
      title: getSettingValue("how_it_works_step3_title", "Payment"),
      description: getSettingValue("how_it_works_step3_description", "Choose your preferred payment method - bank transfer or cash on delivery.")
    },
    {
      title: getSettingValue("how_it_works_step4_title", "Delivery"),
      description: getSettingValue("how_it_works_step4_description", "Receive your pallet at your location or from one of our branches as agreed.")
    }
  ];
  
  // Get explanation content from settings
  const explanationTitle = getSettingValue("how_it_works_explanation_title", "What are Amazon Return Pallets?");
  const explanationDescription = getSettingValue("how_it_works_explanation_description", 
    "Amazon return pallets are products that have been returned by buyers for various reasons to the Amazon platform, and are collected and sold at discounted prices. These products may be:"
  );
  
  // Get product types from settings
  const types = [
    {
      title: getSettingValue("how_it_works_type1_title", "New Products"),
      description: getSettingValue("how_it_works_type1_description", "Not used, but returned for various reasons.")
    },
    {
      title: getSettingValue("how_it_works_type2_title", "Slightly Used Products"),
      description: getSettingValue("how_it_works_type2_description", "Used for a short period then returned.")
    },
    {
      title: getSettingValue("how_it_works_type3_title", "Products with Minor Defects"),
      description: getSettingValue("how_it_works_type3_description", "May contain minor defects in packaging or cosmetic issues that don't affect performance.")
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark">
            {title}
          </h2>
          <p className="mt-4 text-neutral-medium max-w-2xl mx-auto">
            {subtitle}
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
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-white p-6 md:p-8 rounded-xl shadow-md">
          <h3 className="text-2xl font-bold text-neutral-dark mb-4">
            {explanationTitle}
          </h3>
          <p className="text-gray-600 mb-4">
            {explanationDescription}
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {types.map((type, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-primary" />
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
