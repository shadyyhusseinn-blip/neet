import React, { useState, useEffect } from 'react';
import { CloudSun, Cloud, Sun, CloudRain, Snowflake, Wind, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';

interface WeatherData {
  temperature: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy';
  humidity: number;
  windSpeed: number;
  location: string;
}

interface WeatherWidgetProps {
  location?: string;
  showAdvice?: boolean;
}

const defaultWeather: WeatherData = {
  temperature: 25,
  condition: 'sunny',
  humidity: 45,
  windSpeed: 12,
  location: 'القاهرة'
};

const weatherAdvice: Record<string, string> = {
  sunny: 'طقس مشمس مثالي للتصوير الخارجي! استفد من الإضاءة الطبيعية',
  cloudy: 'طقس غائم - إضاءة ناعمة ممتازة للبورتريه',
  rainy: 'طقس ممطر - يفضل التصوير في الاستوديو',
  snowy: 'طقس ثلجي - فرصة رائعة للتصوير الفريد'
};

const weatherIcons: Record<string, any> = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: Snowflake
};

export default function WeatherWidget({
  location = defaultWeather.location,
  showAdvice = true
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>(defaultWeather);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // محاكاة جلب بيانات الطقس
    // في الواقع، يمكنك استخدام API مثل OpenWeatherMap
    const fetchWeather = async () => {
      setLoading(true);
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // هنا يمكنك استبدالها بـ API حقيقي
      setWeather({
        ...defaultWeather,
        location,
        temperature: Math.floor(Math.random() * 15) + 20, // 20-35
        condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)] as any,
        humidity: Math.floor(Math.random() * 40) + 30, // 30-70
        windSpeed: Math.floor(Math.random() * 20) + 5 // 5-25
      });
      setLoading(false);
    };

    fetchWeather();
  }, [location]);

  const WeatherIcon = weatherIcons[weather.condition] || Sun;

  return (
    <section className="py-16 lg:py-24 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <CloudSun className="w-8 h-8 text-blue-400" />
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              حالة الطقس
            </h2>
          </div>

          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl p-8 border border-white/10">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-neutral-400">جاري جلب بيانات الطقس...</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-neutral-400 text-sm mb-1">{weather.location}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-5xl font-bold text-white">
                        {weather.temperature}°
                      </span>
                      <WeatherIcon className="w-12 h-12 text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-400 text-sm">الرطوبة</p>
                    <p className="text-white font-semibold">{weather.humidity}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <Wind className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-neutral-400 text-xs">سرعة الرياح</p>
                      <p className="text-white font-semibold">{weather.windSpeed} كم/س</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-lg">
                    <Droplets className="w-6 h-6 text-blue-400" />
                    <div>
                      <p className="text-neutral-400 text-xs">الرطوبة</p>
                      <p className="text-white font-semibold">{weather.humidity}%</p>
                    </div>
                  </div>
                </div>

                {showAdvice && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <p className="text-neutral-300 text-sm">
                      💡 {weatherAdvice[weather.condition]}
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>

          <p className="text-center text-neutral-500 text-xs mt-4">
            يتم تحديث البيانات تلقائياً
          </p>
        </motion.div>
      </div>
    </section>
  );
}
