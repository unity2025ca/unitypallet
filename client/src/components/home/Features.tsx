import translations from "@/lib/i18n";

const Features = () => {
  const features = translations.features.items;
  
  const featureIcons = [
    "fas fa-box-open",
    "fas fa-tag",
    "fas fa-shield-alt"
  ];
  
  const featureColors = [
    "bg-red-100 text-primary",
    "bg-gray-100 text-black",
    "bg-black text-white"
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark font-primary">
            {translations.features.title}
          </h2>
          <p className="mt-4 text-neutral-medium max-w-2xl mx-auto">
            {translations.features.subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center p-6 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition"
            >
              <div className={`w-16 h-16 flex items-center justify-center rounded-full ${featureColors[index]} mb-4`}>
                <i className={`${featureIcons[index]} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-2 font-primary">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
