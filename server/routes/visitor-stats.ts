import { Request, Response, Router } from 'express';
import * as visitorStats from '../visitor-stats';
import { UAParser } from 'ua-parser-js';
import fetch from 'node-fetch';

const router = Router();

// إضافة زيارة جديدة
router.post('/api/visitor-stats', async (req: Request, res: Response) => {
  try {
    // احصل على عنوان IP الحقيقي للزائر
    const ip = req.headers['x-forwarded-for'] || 
               req.socket.remoteAddress || 
               req.ip || 
               '0.0.0.0';
    
    const ipAddress = Array.isArray(ip) ? ip[0] : ip.split(',')[0].trim();
    
    // تحليل User-Agent
    const userAgentString = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgentString as string);
    const uaResult = parser.getResult();
    
    // تحديد نوع الجهاز
    let deviceType = 'desktop';
    if (uaResult.device.type) {
      if (uaResult.device.type === 'mobile' || uaResult.device.type === 'tablet') {
        deviceType = uaResult.device.type;
      }
    }
    
    // محاولة الحصول على البلد من IP
    let countryCode = null;
    try {
      // استخدام خدمة مجانية للحصول على بيانات جغرافية من IP
      // ملاحظة: هذه الخدمة لها حدود على عدد الطلبات، قد تحتاج استبدالها بخدمة مدفوعة لموقع الإنتاج
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (response.ok) {
        const data = await response.json();
        countryCode = data.country_code;
      }
    } catch (error) {
      console.error('Error fetching country from IP:', error);
    }
    
    // إضافة بيانات الزيارة
    const visitorData = {
      visitDate: new Date(),
      pageUrl: req.body.pageUrl || req.headers.referer || '/',
      visitorIp: ipAddress,
      userAgent: userAgentString as string,
      referrer: req.headers.referer || null,
      countryCode,
      deviceType
    };
    
    const result = await visitorStats.addVisitorStat(visitorData);
    res.status(201).json({ success: true, id: result.id });
  } catch (error) {
    console.error('Error recording visitor stat:', error);
    res.status(500).json({ success: false, error: 'Failed to record visitor statistics' });
  }
});

// الحصول على إحصائيات الزوار حسب التاريخ
router.get('/api/admin/visitor-stats/date-range', async (req: Request, res: Response) => {
  try {
    const days = Number(req.query.days) || 30;
    const result = await visitorStats.getVisitorStatsByDateRange(days);
    res.json(result);
  } catch (error) {
    console.error('Error getting visitor stats by date range:', error);
    res.status(500).json({ error: 'Failed to fetch visitor statistics' });
  }
});

// الحصول على إجمالي عدد الزيارات
router.get('/api/admin/visitor-stats/count', async (req: Request, res: Response) => {
  try {
    const count = await visitorStats.getVisitorStatsCount();
    res.json({ count });
  } catch (error) {
    console.error('Error getting visitor count:', error);
    res.status(500).json({ error: 'Failed to fetch visitor count' });
  }
});

// الحصول على إحصائيات الزوار حسب الصفحة
router.get('/api/admin/visitor-stats/pages', async (req: Request, res: Response) => {
  try {
    const result = await visitorStats.getPageViewsByUrl();
    res.json(result);
  } catch (error) {
    console.error('Error getting page views:', error);
    res.status(500).json({ error: 'Failed to fetch page views' });
  }
});

// الحصول على إحصائيات الزوار حسب البلد
router.get('/api/admin/visitor-stats/countries', async (req: Request, res: Response) => {
  try {
    const result = await visitorStats.getVisitorStatsByCountry();
    res.json(result);
  } catch (error) {
    console.error('Error getting visitor stats by country:', error);
    res.status(500).json({ error: 'Failed to fetch visitor statistics by country' });
  }
});

// الحصول على إحصائيات الزوار حسب نوع الجهاز
router.get('/api/admin/visitor-stats/devices', async (req: Request, res: Response) => {
  try {
    const result = await visitorStats.getVisitorStatsByDevice();
    res.json(result);
  } catch (error) {
    console.error('Error getting visitor stats by device:', error);
    res.status(500).json({ error: 'Failed to fetch visitor statistics by device' });
  }
});

export default router;