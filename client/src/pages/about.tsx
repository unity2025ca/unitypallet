import translations from "@/lib/i18n";

const AboutPage = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="md:flex items-center">
          <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
            <img 
              src="https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80" 
              alt="Unity فريق عمل" 
              className="rounded-lg shadow-xl w-full" 
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-neutral-dark font-tajawal mb-6">
              {translations.about.title}
            </h2>
            <p className="text-gray-600 mb-6">
              {translations.about.description}
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-primary font-tajawal mb-3">
                {translations.about.vision.title}
              </h3>
              <p className="text-gray-700">
                {translations.about.vision.description}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-primary font-bold mb-2">+500</div>
                <p className="text-gray-600">{translations.about.stats.pallets}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-primary font-bold mb-2">+300</div>
                <p className="text-gray-600">{translations.about.stats.customers}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/1024px-Amazon_logo.svg.png" alt="Amazon Logo" className="h-8" />
              <p className="font-semibold">{translations.about.partner}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;
