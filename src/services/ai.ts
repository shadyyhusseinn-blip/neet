import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { Revenue, Booking } from "../types";

const API_KEY = (import.meta as any).env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const aiService = {
  /**
   * Predict revenue for the next month based on historical data
   */
  async predictRevenue(revenues: Revenue[], bookings: Booking[]): Promise<string> {
    if (!API_KEY || revenues.length < 5) {
      return "لا توجد بيانات كافية للتحليل حالياً.";
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
        بصفتك محلل بيانات مالي لمصور فوتوغرافي، قم بتحليل البيانات التالية وتوقع دخل الشهر القادم.
        
        بيانات الدخل السابقة (آخر 30 سجل):
        ${JSON.stringify(revenues.slice(-30).map(r => ({ amount: r.amount, date: r.date, type: r.type })))}
        
        بيانات الحجوزات القادمة:
        ${JSON.stringify(bookings.filter(b => b.status !== 'cancelled').map(b => ({ date: b.date, total: b.totalPrice, remaining: b.remainingAmount })))}
        
        المطلوب:
        1. توقع رقم تقريبي لدخل الشهر القادم بالجنيه المصري.
        2. ذكر أهم 3 نصائح لزيادة الدخل بناءً على الأنماط الملاحظة.
        3. كن مختصراً ومهنياً باللغة العربية.
      `;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("AI Revenue Prediction Error:", error);
      return "عذراً، فشل النظام في تحليل البيانات حالياً.";
    }
  },

  /**
   * Analyze an image of a receipt using Gemini Vision
   */
  async analyzeReceipt(base64Image: string): Promise<{ amount: number, date: string, items: string[], notes: string } | null> {
    if (!API_KEY) return null;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        قم بتحليل صورة وصل المصاريف (الفاتورة) واستخراج البيانات التالية بدقة بتنسيق JSON:
        - amount: المبلغ الإجمالي (رقم فقط)
        - date: التاريخ (YYYY-MM-DD)
        - items: قائمة بالأصناف المشتراة
        - notes: تصنيف المصروف (مثلاً: أدوات مكتبية، كهرباء، صيانة معدات)
        
        إذا لم تجد بياناً معيناً، اترك الحقل فارغاً.
      `;

      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image.split(',')[1] || base64Image,
            mimeType: "image/jpeg"
          }
        }
      ]);

      const text = result.response.text();
      // Simple JSON extraction from text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error("AI Receipt Analysis Error:", error);
      return null;
    }
  }
};
