// Simple i18n utility for direct string translations
// In a more complex app, we would use i18next

export const translations = {
  navItems: {
    home: "Home",
    shop: "Shop",
    about: "About Us",
    howItWorks: "How It Works",
    faq: "FAQ",
    contact: "Contact Us",
    admin: "Admin Panel"
  },
  hero: {
    title: "Get the Best Deals on Amazon Return Pallets!",
    subtitle: "Your opportunity to get authentic products at heavily discounted prices. Various pallets with guaranteed quality.",
    browseButton: "Browse Pallets",
    howItWorksButton: "How Does It Work?"
  },
  features: {
    title: "Why Buy from Unity?",
    subtitle: "We offer the best Amazon return pallets at competitive prices and guaranteed quality",
    items: [
      {
        title: "Authentic Products",
        description: "All products are 100% authentic as they are returns from the global Amazon platform."
      },
      {
        title: "Competitive Prices",
        description: "Significantly reduced prices compared to original market prices."
      },
      {
        title: "Complete Transparency",
        description: "We clearly explain the contents of each pallet and the condition of the products with full transparency."
      }
    ]
  },
  shop: {
    title: "Shop Available Pallets",
    subtitle: "Choose from our diverse collection of Amazon return pallets",
    categories: {
      all: "All",
      electronics: "Electronics",
      home: "Home",
      toys: "Toys",
      mixed: "Mixed",
      other: "Other"
    },
    status: {
      available: "Available",
      limited: "Limited",
      soldout: "Sold Out"
    },
    detailsButton: "Details",
    loadMore: "Load More Pallets"
  },
  about: {
    title: "About Us",
    description: "At Unity, we strive to provide authentic products at discounted prices through Amazon return pallets to customers in Saudi Arabia. We believe in delivering value and quality simultaneously.",
    vision: {
      title: "Our Vision",
      description: "To be the primary destination for consumers seeking great deals and investment opportunities in e-commerce returns."
    },
    stats: {
      pallets: "Pallets Sold",
      customers: "Satisfied Customers"
    },
    partner: "Trusted Amazon Returns Partner"
  },
  howItWorks: {
    title: "How It Works?",
    subtitle: "Simple steps to get Amazon return pallets",
    steps: [
      {
        title: "Choose a Pallet",
        description: "Browse available pallets and choose what suits your needs and interests."
      },
      {
        title: "Contact Us",
        description: "Via WhatsApp or contact form to inquire and confirm your order."
      },
      {
        title: "Payment",
        description: "Choose your preferred payment method - bank transfer or cash on delivery."
      },
      {
        title: "Delivery",
        description: "Receive your pallet at your location or from one of our branches as agreed."
      }
    ],
    explanation: {
      title: "What are Amazon Return Pallets?",
      description: "Amazon return pallets are products that have been returned by buyers for various reasons to the Amazon platform, and are collected and sold at discounted prices. These products may be:",
      types: [
        {
          title: "New Products",
          description: "Not used, but returned for various reasons."
        },
        {
          title: "Slightly Used Products",
          description: "Used for a short period then returned."
        },
        {
          title: "Products with Minor Defects",
          description: "May contain minor defects in packaging or cosmetic issues that don't affect performance."
        }
      ]
    }
  },
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Answers to the most common questions about Amazon return pallets",
    questions: [
      {
        question: "Can I know the contents of the pallet before purchase?",
        answer: "Yes, we provide a general list of pallet contents and illustrative images of the contents. However, we cannot provide a detailed accurate list of every content, as part of the fun in this experience is the element of surprise. We guarantee the value and quality of the products in proportion to the price paid."
      },
      {
        question: "Do all products work well?",
        answer: "We examine products before offering them for sale. Most products are new or slightly used, and work well. If there are any products that don't work properly, we clarify this in the pallet description. We are committed to complete transparency regarding the condition of products."
      },
      {
        question: "Can I exchange or return the pallet after purchase?",
        answer: "Due to the nature of pallets and returned products, we don't accept exchanges or returns after sale. Therefore, we advise making sure of the desire to purchase before completing the process. In exceptional cases such as a substantial difference between the pallet description and actual content, the matter can be discussed with our customer service team."
      },
      {
        question: "Do you provide delivery service?",
        answer: "Yes, we provide delivery service across various regions of Saudi Arabia. The cost of delivery depends on the pallet weight and distance. We can also coordinate direct pickup from our warehouse if you prefer."
      },
      {
        question: "How long does the delivery process take?",
        answer: "The delivery process usually takes 3-7 business days, depending on your location. We ensure to keep you informed about the status of your order during the shipping process."
      }
    ]
  },
  contact: {
    title: "Contact Us",
    subtitle: "Do you have a question or inquiry? We are here to help. You can contact us through the form or through other means of communication.",
    form: {
      name: "Full Name",
      email: "Email",
      phone: "Mobile Number",
      message: "Message",
      submit: "Send Message"
    },
    info: {
      title: "Contact Information",
      address: {
        label: "Address",
        value: "Riyadh, Saudi Arabia"
      },
      phone: {
        label: "Phone",
        value: "+966 50 123 4567"
      },
      email: {
        label: "Email",
        value: "info@jaberco.com"
      },
      whatsapp: {
        label: "WhatsApp",
        value: "+1 289 216 6500"
      },
      social: {
        label: "Follow Us On"
      }
    }
  },
  cta: {
    title: "Ready for Special Deals?",
    subtitle: "Join the list of distinguished customers and get notifications about the latest pallets and special offers!",
    placeholder: "Enter your email",
    button: "Subscribe Now"
  },
  footer: {
    description: "The primary destination for getting Amazon return pallets at competitive prices and guaranteed quality.",
    quickLinks: "Quick Links",
    categories: "Product Categories",
    contact: "Contact Us",
    copyright: "© 2023 Jaberco. All rights reserved."
  },
  admin: {
    login: {
      title: "Login to Admin Panel",
      username: "Username",
      password: "Password",
      submit: "Login",
      error: "Invalid username or password"
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome to Jaberco Control Panel",
      stats: {
        products: "Products",
        contacts: "Messages",
        subscribers: "Subscribers"
      }
    },
    products: {
      title: "Manage Products",
      add: "Add New Product",
      edit: "Edit Product",
      delete: "Delete Product",
      confirmDelete: "Are you sure you want to delete this product?",
      form: {
        title: "Title (English)",
        titleAr: "Title (Arabic)",
        description: "Description (English)",
        descriptionAr: "Description (Arabic)",
        category: "Category",
        status: "Status",
        price: "Price (SAR)",
        imageUrl: "Image URL",
        submit: "Save Product"
      }
    },
    orders: {
      title: "Contact Requests",
      noOrders: "No contact requests currently"
    },
    sidebar: {
      dashboard: "Dashboard",
      products: "Products",
      orders: "Orders",
      logout: "Logout"
    }
  }
};

export default translations;
