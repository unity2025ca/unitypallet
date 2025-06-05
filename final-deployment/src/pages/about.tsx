import translations from "@/lib/i18n";
import { useSettings } from "@/hooks/use-settings";

const AboutPage = () => {
  const { getSettingValue } = useSettings();

  return (
    <section id="about" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="md:flex items-center">
          <div className="md:w-1/2 md:pl-12 mb-8 md:mb-0">
            <img 
              src={getSettingValue('about_image', 'https://images.unsplash.com/photo-1577415124269-fc1140a69e91?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80')} 
              alt="Jaberco Team" 
              className="rounded-lg shadow-xl w-full" 
            />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-neutral-dark font-tajawal mb-2">
              {getSettingValue('about_title', translations.about.title)}
            </h2>
            <h3 className="text-xl text-gray-700 mb-4">
              {getSettingValue('about_subtitle', 'Your Trusted Source for Amazon Return Pallets')}
            </h3>
            <p className="text-gray-600 mb-6">
              {getSettingValue('about_description', translations.about.description)}
            </p>
            
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-primary font-tajawal mb-3">
                {translations.about.vision.title}
              </h3>
              <p className="text-gray-700">
                {getSettingValue('about_vision', translations.about.vision.description)}
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-primary font-tajawal mb-3">
                Our Mission
              </h3>
              <p className="text-gray-700">
                {getSettingValue('about_mission', 'Our mission is to provide access to quality Amazon return pallets at affordable prices while maintaining the highest standards of customer service and satisfaction.')}
              </p>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 className="text-xl font-semibold text-primary font-tajawal mb-3">
                Our History
              </h3>
              <p className="text-gray-700">
                {getSettingValue('about_history', 'Founded in 2022, Jaberco started with a simple goal: to make Amazon return pallets accessible to resellers and businesses of all sizes. What began as a small operation has grown into a trusted source for quality products across Canada.')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-primary font-bold mb-2">+{getSettingValue('about_pallets_count', '500')}</div>
                <p className="text-gray-600">{translations.about.stats.pallets}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-3xl text-primary font-bold mb-2">+{getSettingValue('about_customers_count', '300')}</div>
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
