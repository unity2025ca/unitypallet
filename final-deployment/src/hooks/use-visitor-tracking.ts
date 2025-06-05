import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

/**
 * الملاحظة: يستخدم هذا الهوك لتتبع زيارات الصفحات في التطبيق
 * يجب استدعاؤه في المكون الرئيسي للتطبيق (App.tsx) لتتبع جميع الصفحات
 */
export function useVisitorTracking() {
  const [location] = useLocation();

  useEffect(() => {
    // تجاهل تتبع لوحة التحكم
    if (location.startsWith('/admin')) {
      return;
    }

    // إرسال بيانات الزيارة إلى الخادم
    const recordVisit = async () => {
      try {
        await apiRequest('POST', '/api/visitor-stats', {
          pageUrl: location || '/'
        });
        console.log('Visit recorded for:', location);
      } catch (error) {
        console.error('Failed to record page visit:', error);
      }
    };

    // تسجيل الزيارة بعد تأخير بسيط للتأكد من اكتمال تحميل الصفحة
    const timeout = setTimeout(() => {
      recordVisit();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [location]);
}