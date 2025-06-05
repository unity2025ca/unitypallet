/**
 * تحديث storage-simple.ts بجميع البيانات المستوردة الكاملة
 * Update storage-simple.ts with complete imported data
 */

import fs from 'fs';

// قراءة البيانات الكاملة المستوردة
const completeData = JSON.parse(fs.readFileSync('./exported_data/complete_database_export.json', 'utf8'));

// قراءة ملف storage-simple.ts الحالي
let storageContent = fs.readFileSync('./server/storage-simple.ts', 'utf8');

// إنشاء كود تحميل البيانات الكاملة
const dataLoadingCode = `
  // تحميل البيانات المستوردة الكاملة من قاعدة البيانات الخارجية
  private loadCompleteImportedData() {
    console.log('بدء تحميل البيانات المستوردة الكاملة...');
    console.log('Loading complete imported data...');
    
    try {
      // تحميل البيانات من الملف المصدر
      const completeExportData = ${JSON.stringify(completeData, null, 2)};
      
      // تحديث البيانات في الذاكرة
      this.loadUsersFromExport(completeExportData.users || []);
      this.loadProductsFromExport(completeExportData.products || []);
      this.loadContactsFromExport(completeExportData.contacts || []);
      this.loadSettingsFromExport(completeExportData.settings || []);
      this.loadCategoriesFromExport(completeExportData.categories || []);
      this.loadAppointmentsFromExport(completeExportData.appointments || []);
      this.loadOrdersFromExport(completeExportData.orders || []);
      this.loadCartsFromExport(completeExportData.carts || []);
      this.loadCartItemsFromExport(completeExportData.cart_items || []);
      this.loadSubscribersFromExport(completeExportData.subscribers || []);
      this.loadFaqsFromExport(completeExportData.faqs || []);
      this.loadNotificationsFromExport(completeExportData.notifications || []);
      this.loadOrderItemsFromExport(completeExportData.order_items || []);
      this.loadShippingZonesFromExport(completeExportData.shipping_zones || []);
      this.loadShippingRatesFromExport(completeExportData.shipping_rates || []);
      this.loadLocationsFromExport(completeExportData.locations || []);
      this.loadAllowedCitiesFromExport(completeExportData.allowed_cities || []);
      this.loadVisitorStatsFromExport(completeExportData.visitor_stats || []);
      this.loadProductImagesFromExport(completeExportData.product_images || []);
      
      console.log('تم تحميل جميع البيانات المستوردة بنجاح');
      console.log('All imported data loaded successfully');
      
      // طباعة إحصائيات البيانات المحملة
      console.log('إحصائيات البيانات المحملة:');
      console.log(\`المستخدمون: \${this._users.size}\`);
      console.log(\`المنتجات: \${this._products.size}\`);
      console.log(\`جهات الاتصال: \${this._contacts.size}\`);
      console.log(\`الإعدادات: \${this._settings.size}\`);
      console.log(\`الفئات: \${this._categories.size}\`);
      console.log(\`المواعيد: \${this._appointments.size}\`);
      console.log(\`الطلبات: \${this._orders.size}\`);
      console.log(\`سلال التسوق: \${this._carts.size}\`);
      console.log(\`عناصر السلة: \${this._cartItems.size}\`);
      console.log(\`المشتركون: \${this._subscribers.size}\`);
      console.log(\`الأسئلة الشائعة: \${this._faqs.size}\`);
      console.log(\`الإشعارات: \${this._notifications.size}\`);
      console.log(\`عناصر الطلبات: \${this._orderItems.size}\`);
      console.log(\`مناطق الشحن: \${this._shippingZones.size}\`);
      console.log(\`أسعار الشحن: \${this._shippingRates.size}\`);
      console.log(\`المواقع: \${this._locations.size}\`);
      console.log(\`المدن المسموحة: \${this._allowedCities.size}\`);
      console.log(\`إحصائيات الزوار: \${this._visitorStats.size}\`);
      console.log(\`صور المنتجات: \${this._productImages.size}\`);
      
    } catch (error) {
      console.error('خطأ في تحميل البيانات المستوردة:', error);
      console.error('Error loading imported data:', error);
    }
  }`;

// البحث عن موقع إدخال الكود
const constructorEndIndex = storageContent.indexOf('this.sessionStore = new MemoryStore(');
if (constructorEndIndex !== -1) {
  const nextLineIndex = storageContent.indexOf('\n', constructorEndIndex);
  const insertIndex = storageContent.indexOf('\n', nextLineIndex) + 1;
  
  // إضافة استدعاء تحميل البيانات الكاملة
  const beforeInsert = storageContent.substring(0, insertIndex);
  const afterInsert = storageContent.substring(insertIndex);
  
  storageContent = beforeInsert + '\n    // تحميل البيانات المستوردة الكاملة\n    this.loadCompleteImportedData();\n' + afterInsert;
}

// إضافة دالة تحميل البيانات في نهاية الكلاس
const classEndIndex = storageContent.lastIndexOf('}');
storageContent = storageContent.substring(0, classEndIndex) + dataLoadingCode + '\n}\n';

// كتابة الملف المحدث
fs.writeFileSync('./server/storage-simple-updated.ts', storageContent);

console.log('تم إنشاء ملف storage-simple-updated.ts مع جميع البيانات المستوردة');
console.log('Created storage-simple-updated.ts with all imported data');

// إحصائيات البيانات
console.log('\nإحصائيات البيانات الكاملة المستوردة:');
Object.keys(completeData).forEach(table => {
  if (Array.isArray(completeData[table])) {
    console.log(`${table}: ${completeData[table].length} سجل`);
  }
});