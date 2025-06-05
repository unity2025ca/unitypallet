import fetch from 'node-fetch';

async function testAdminEndpoints() {
  const baseUrl = 'http://localhost:5000';
  
  // Test public endpoints first
  const publicTests = [
    '/api/products',
    '/api/settings', 
    '/api/admin/faqs',
    '/api/categories'
  ];
  
  console.log('فحص الواجهات العامة:');
  console.log('==================');
  
  for (const endpoint of publicTests) {
    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      const data = await response.json();
      const count = Array.isArray(data) ? data.length : 'N/A';
      console.log(`✓ ${endpoint}: ${response.status} - العناصر: ${count}`);
    } catch (error) {
      console.log(`✗ ${endpoint}: خطأ - ${error.message}`);
    }
  }
  
  console.log('\nفحص الجداول والبيانات:');
  console.log('=====================');
  
  // Test data counts
  const dataTests = [
    { name: 'المنتجات', endpoint: '/api/products' },
    { name: 'الإعدادات', endpoint: '/api/settings' },
    { name: 'الأسئلة الشائعة', endpoint: '/api/admin/faqs' },
    { name: 'الفئات', endpoint: '/api/categories' }
  ];
  
  for (const test of dataTests) {
    try {
      const response = await fetch(`${baseUrl}${test.endpoint}`);
      if (response.ok) {
        const data = await response.json();
        const count = Array.isArray(data) ? data.length : 'N/A';
        console.log(`✓ ${test.name}: ${count} عنصر`);
      } else {
        console.log(`✗ ${test.name}: خطأ ${response.status}`);
      }
    } catch (error) {
      console.log(`✗ ${test.name}: خطأ في الاتصال`);
    }
  }
}

testAdminEndpoints().catch(console.error);