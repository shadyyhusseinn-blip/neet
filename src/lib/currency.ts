// Multi-currency Support

export type Currency = 'EGP' | 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED';

export interface CurrencyRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: number;
}

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  locale: string;
  flag: string;
}

export const currencies: Record<Currency, CurrencyInfo> = {
  EGP: {
    code: 'EGP',
    name: 'Egyptian Pound',
    symbol: 'ج.م',
    locale: 'ar-EG',
    flag: '🇪🇬',
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    locale: 'en-US',
    flag: '🇺🇸',
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    locale: 'fr-FR',
    flag: '🇪🇺',
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    locale: 'en-GB',
    flag: '🇬🇧',
  },
  SAR: {
    code: 'SAR',
    name: 'Saudi Riyal',
    symbol: 'ر.س',
    locale: 'ar-SA',
    flag: '🇸🇦',
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'د.إ',
    locale: 'ar-AE',
    flag: '🇦🇪',
  },
};

// Default exchange rates (base: EGP)
const defaultRates: Record<Currency, number> = {
  EGP: 1,
  USD: 0.032,
  EUR: 0.029,
  GBP: 0.025,
  SAR: 0.12,
  AED: 0.12,
};

export class CurrencyService {
  private static currentCurrency: Currency = 'EGP';
  private static rates: Record<Currency, number> = { ...defaultRates };
  private static lastRateUpdate: number = Date.now();

  // Initialize
  static initialize(): void {
    const savedCurrency = localStorage.getItem('currency') as Currency;
    if (savedCurrency && currencies[savedCurrency]) {
      this.currentCurrency = savedCurrency;
    }

    const savedRates = localStorage.getItem('currency_rates');
    if (savedRates) {
      try {
        const parsed = JSON.parse(savedRates);
        this.rates = parsed.rates;
        this.lastRateUpdate = parsed.lastUpdate;
      } catch (error) {
        console.error('Failed to load currency rates:', error);
      }
    }

    // Update rates if older than 24 hours
    if (Date.now() - this.lastRateUpdate > 24 * 60 * 60 * 1000) {
      this.updateRates();
    }
  }

  // Set currency
  static setCurrency(currency: Currency): void {
    if (!currencies[currency]) return;

    this.currentCurrency = currency;
    localStorage.setItem('currency', currency);
  }

  // Get current currency
  static getCurrency(): Currency {
    return this.currentCurrency;
  }

  // Get currency info
  static getCurrencyInfo(currency?: Currency): CurrencyInfo {
    return currencies[currency || this.currentCurrency];
  }

  // Get available currencies
  static getAvailableCurrencies(): CurrencyInfo[] {
    return Object.values(currencies);
  }

  // Convert amount
  static convert(amount: number, from: Currency, to: Currency): number {
    if (from === to) return amount;

    const fromRate = this.rates[from];
    const toRate = this.rates[to];

    // Convert to base currency (EGP) first, then to target
    const baseAmount = amount / fromRate;
    return baseAmount * toRate;
  }

  // Convert to current currency
  static convertToCurrent(amount: number, from: Currency): number {
    return this.convert(amount, from, this.currentCurrency);
  }

  // Format amount
  static format(amount: number, currency?: Currency): string {
    const curr = currency || this.currentCurrency;
    const info = currencies[curr];

    return new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Format amount without symbol
  static formatAmount(amount: number, currency?: Currency): string {
    const curr = currency || this.currentCurrency;
    const info = currencies[curr];

    return new Intl.NumberFormat(info.locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Get currency symbol
  static getSymbol(currency?: Currency): string {
    const curr = currency || this.currentCurrency;
    return currencies[curr].symbol;
  }

  // Update exchange rates
  static async updateRates(): Promise<boolean> {
    try {
      // In production, this would fetch from a real API
      // For now, we'll use default rates
      this.rates = { ...defaultRates };
      this.lastRateUpdate = Date.now();

      localStorage.setItem(
        'currency_rates',
        JSON.stringify({
          rates: this.rates,
          lastUpdate: this.lastRateUpdate,
        })
      );

      return true;
    } catch (error) {
      console.error('Failed to update currency rates:', error);
      return false;
    }
  }

  // Get exchange rate
  static getRate(from: Currency, to: Currency): number {
    return this.convert(1, from, to);
  }

  // Get all rates
  static getAllRates(base: Currency = 'EGP'): Record<Currency, number> {
    const rates: Record<Currency, number> = {} as any;

    for (const currency of Object.keys(currencies) as Currency[]) {
      rates[currency] = this.convert(1, base, currency);
    }

    return rates;
  }

  // Calculate price in different currencies
  static calculatePrices(price: number, baseCurrency: Currency): Record<Currency, number> {
    const prices: Record<Currency, number> = {} as any;

    for (const currency of Object.keys(currencies) as Currency[]) {
      prices[currency] = this.convert(price, baseCurrency, currency);
    }

    return prices;
  }

  // Round to currency precision
  static round(amount: number, currency?: Currency): number {
    const curr = currency || this.currentCurrency;
    return Math.round(amount * 100) / 100;
  }

  // Check if currency is RTL
  static isRTL(currency?: Currency): boolean {
    const curr = currency || this.currentCurrency;
    return curr === 'EGP' || curr === 'SAR' || curr === 'AED';
  }

  // Get last rate update time
  static getLastRateUpdate(): Date {
    return new Date(this.lastRateUpdate);
  }

  // Format price range
  static formatRange(min: number, max: number, currency?: Currency): string {
    const curr = currency || this.currentCurrency;
    const info = currencies[curr];

    const formatter = new Intl.NumberFormat(info.locale, {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }

  // Parse amount from string
  static parseAmount(value: string, currency?: Currency): number {
    const curr = currency || this.currentCurrency;
    const info = currencies[curr];

    // Remove currency symbol and other non-numeric characters
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);

    return isNaN(parsed) ? 0 : parsed;
  }

  // Add custom rate
  static setCustomRate(from: Currency, to: Currency, rate: number): void {
    // In production, this would update the rate in the database
    console.log(`Setting custom rate: ${from} -> ${to} = ${rate}`);
  }

  // Get rate history (would require backend)
  static async getRateHistory(from: Currency, to: Currency, days: number = 30): Promise<Array<{ date: Date; rate: number }>> {
    // In production, this would fetch from a database
    return [];
  }

  // Compare prices in different currencies
  static comparePrices(prices: Record<Currency, number>): Currency {
    let bestCurrency: Currency = 'EGP';
    let bestPrice = Infinity;

    for (const [currency, price] of Object.entries(prices) as [Currency, number][]) {
      // Convert all to base currency (EGP) for comparison
      const basePrice = this.convert(price, currency, 'EGP');
      if (basePrice < bestPrice) {
        bestPrice = basePrice;
        bestCurrency = currency;
      }
    }

    return bestCurrency;
  }

  // Validate currency code
  static isValidCurrency(code: string): code is Currency {
    return code in currencies;
  }

  // Get currency by country code
  static getCurrencyByCountry(countryCode: string): Currency {
    const countryMap: Record<string, Currency> = {
      EG: 'EGP',
      US: 'USD',
      GB: 'GBP',
      SA: 'SAR',
      AE: 'AED',
      FR: 'EUR',
      DE: 'EUR',
      IT: 'EUR',
      ES: 'EUR',
    };

    return countryMap[countryCode] || 'EGP';
  }

  // Auto-detect currency from locale
  static detectCurrency(): Currency {
    const locale = navigator.language;
    const currencyCode = new Intl.NumberFormat(locale).resolvedOptions().currency;

    if (currencyCode && this.isValidCurrency(currencyCode)) {
      return currencyCode;
    }

    return 'EGP';
  }
}

export const currencyService = CurrencyService;
