// Multi-language Support (i18n)

export type Language = 'ar' | 'en' | 'fr' | 'es';

export interface Translation {
  [key: string]: string | Translation;
}

export const translations: Record<Language, Translation> = {
  ar: {
    // Common
    home: 'الرئيسية',
    about: 'عن الاستوديو',
    portfolio: 'معرض الأعمال',
    packages: 'الباقات',
    contact: 'تواصل معنا',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
    register: 'إنشاء حساب',
    dashboard: 'لوحة التحكم',
    settings: 'الإعدادات',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    sort: 'ترتيب',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    submit: 'إرسال',
    close: 'إغلاق',
    yes: 'نعم',
    no: 'لا',
    or: 'أو',
    and: 'و',
    of: 'من',
    to: 'إلى',
    from: 'من',
    at: 'في',
    by: 'بواسطة',
    with: 'مع',
    for: 'لـ',
    
    // Navigation
    nav_home: 'الرئيسية',
    nav_about: 'عن الاستوديو',
    nav_portfolio: 'معرض الأعمال',
    nav_packages: 'الباقات',
    nav_contact: 'تواصل معنا',
    nav_login: 'تسجيل الدخول',
    nav_register: 'إنشاء حساب',
    
    // Dashboard
    dashboard_title: 'لوحة التحكم',
    dashboard_overview: 'نظرة عامة',
    dashboard_bookings: 'الحجوزات',
    dashboard_customers: 'العملاء',
    dashboard_revenue: 'الإيرادات',
    dashboard_team: 'الفريق',
    dashboard_equipment: 'المعدات',
    
    // Bookings
    bookings_title: 'الحجوزات',
    bookings_new: 'حجز جديد',
    bookings_view: 'عرض الحجز',
    bookings_edit: 'تعديل الحجز',
    bookings_delete: 'حذف الحجز',
    bookings_status: 'الحالة',
    bookings_date: 'التاريخ',
    bookings_time: 'الوقت',
    bookings_package: 'الباقة',
    bookings_customer: 'العميل',
    bookings_price: 'السعر',
    bookings_deposit: 'الدفعة المقدمة',
    bookings_remaining: 'المتبقي',
    bookings_notes: 'ملاحظات',
    
    // Customers
    customers_title: 'العملاء',
    customers_name: 'الاسم',
    customers_email: 'البريد الإلكتروني',
    customers_phone: 'الهاتف',
    customers_address: 'العنوان',
    customers_bookings: 'الحجوزات',
    customers_total_spent: 'إجمالي الإنفاق',
    
    // Packages
    packages_title: 'الباقات',
    packages_name: 'اسم الباقة',
    packages_description: 'الوصف',
    packages_price: 'السعر',
    packages_duration: 'المدة',
    packages_includes: 'يشمل',
    packages_features: 'المميزات',
    
    // Team
    team_title: 'الفريق',
    team_name: 'الاسم',
    team_role: 'الدور',
    team_email: 'البريد الإلكتروني',
    team_phone: 'الهاتف',
    team_status: 'الحالة',
    
    // Equipment
    equipment_title: 'المعدات',
    equipment_name: 'الاسم',
    equipment_category: 'الفئة',
    equipment_status: 'الحالة',
    equipment_maintenance: 'الصيانة',
    
    // Reports
    reports_title: 'التقارير',
    reports_financial: 'التقارير المالية',
    reports_analytics: 'التحليلات',
    reports_export: 'تصدير',
    
    // Settings
    settings_title: 'الإعدادات',
    settings_profile: 'الملف الشخصي',
    settings_security: 'الأمان',
    settings_notifications: 'الإشعارات',
    settings_language: 'اللغة',
    settings_theme: 'المظهر',
    settings_currency: 'العملة',
    
    // Messages
    msg_login_success: 'تم تسجيل الدخول بنجاح',
    msg_login_error: 'فشل تسجيل الدخول',
    msg_save_success: 'تم الحفظ بنجاح',
    msg_delete_success: 'تم الحذف بنجاح',
    msg_delete_error: 'فشل الحذف',
    msg_confirm_delete: 'هل أنت متأكد من الحذف؟',
    msg_required_field: 'هذا الحقل مطلوب',
    msg_invalid_email: 'البريد الإلكتروني غير صالح',
    msg_invalid_phone: 'رقم الهاتف غير صالح',
  },
  en: {
    // Common
    home: 'Home',
    about: 'About',
    portfolio: 'Portfolio',
    packages: 'Packages',
    contact: 'Contact',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    dashboard: 'Dashboard',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    yes: 'Yes',
    no: 'No',
    or: 'Or',
    and: 'And',
    of: 'Of',
    to: 'To',
    from: 'From',
    at: 'At',
    by: 'By',
    with: 'With',
    for: 'For',
    
    // Navigation
    nav_home: 'Home',
    nav_about: 'About',
    nav_portfolio: 'Portfolio',
    nav_packages: 'Packages',
    nav_contact: 'Contact',
    nav_login: 'Login',
    nav_register: 'Register',
    
    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_overview: 'Overview',
    dashboard_bookings: 'Bookings',
    dashboard_customers: 'Customers',
    dashboard_revenue: 'Revenue',
    dashboard_team: 'Team',
    dashboard_equipment: 'Equipment',
    
    // Bookings
    bookings_title: 'Bookings',
    bookings_new: 'New Booking',
    bookings_view: 'View Booking',
    bookings_edit: 'Edit Booking',
    bookings_delete: 'Delete Booking',
    bookings_status: 'Status',
    bookings_date: 'Date',
    bookings_time: 'Time',
    bookings_package: 'Package',
    bookings_customer: 'Customer',
    bookings_price: 'Price',
    bookings_deposit: 'Deposit',
    bookings_remaining: 'Remaining',
    bookings_notes: 'Notes',
    
    // Customers
    customers_title: 'Customers',
    customers_name: 'Name',
    customers_email: 'Email',
    customers_phone: 'Phone',
    customers_address: 'Address',
    customers_bookings: 'Bookings',
    customers_total_spent: 'Total Spent',
    
    // Packages
    packages_title: 'Packages',
    packages_name: 'Package Name',
    packages_description: 'Description',
    packages_price: 'Price',
    packages_duration: 'Duration',
    packages_includes: 'Includes',
    packages_features: 'Features',
    
    // Team
    team_title: 'Team',
    team_name: 'Name',
    team_role: 'Role',
    team_email: 'Email',
    team_phone: 'Phone',
    team_status: 'Status',
    
    // Equipment
    equipment_title: 'Equipment',
    equipment_name: 'Name',
    equipment_category: 'Category',
    equipment_status: 'Status',
    equipment_maintenance: 'Maintenance',
    
    // Reports
    reports_title: 'Reports',
    reports_financial: 'Financial Reports',
    reports_analytics: 'Analytics',
    reports_export: 'Export',
    
    // Settings
    settings_title: 'Settings',
    settings_profile: 'Profile',
    settings_security: 'Security',
    settings_notifications: 'Notifications',
    settings_language: 'Language',
    settings_theme: 'Theme',
    settings_currency: 'Currency',
    
    // Messages
    msg_login_success: 'Login successful',
    msg_login_error: 'Login failed',
    msg_save_success: 'Saved successfully',
    msg_delete_success: 'Deleted successfully',
    msg_delete_error: 'Delete failed',
    msg_confirm_delete: 'Are you sure you want to delete?',
    msg_required_field: 'This field is required',
    msg_invalid_email: 'Invalid email address',
    msg_invalid_phone: 'Invalid phone number',
  },
  fr: {
    // Common
    home: 'Accueil',
    about: 'À propos',
    portfolio: 'Portfolio',
    packages: 'Forfaits',
    contact: 'Contact',
    login: 'Connexion',
    logout: 'Déconnexion',
    register: 'S\'inscrire',
    dashboard: 'Tableau de bord',
    settings: 'Paramètres',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    close: 'Fermer',
    yes: 'Oui',
    no: 'Non',
    
    // Navigation
    nav_home: 'Accueil',
    nav_about: 'À propos',
    nav_portfolio: 'Portfolio',
    nav_packages: 'Forfaits',
    nav_contact: 'Contact',
    nav_login: 'Connexion',
    nav_register: 'S\'inscrire',
    
    // Dashboard
    dashboard_title: 'Tableau de bord',
    dashboard_overview: 'Aperçu',
    dashboard_bookings: 'Réservations',
    dashboard_customers: 'Clients',
    dashboard_revenue: 'Revenus',
    dashboard_team: 'Équipe',
    dashboard_equipment: 'Équipement',
    
    // Bookings
    bookings_title: 'Réservations',
    bookings_new: 'Nouvelle réservation',
    bookings_view: 'Voir la réservation',
    bookings_edit: 'Modifier la réservation',
    bookings_delete: 'Supprimer la réservation',
    bookings_status: 'Statut',
    bookings_date: 'Date',
    bookings_time: 'Heure',
    bookings_package: 'Forfait',
    bookings_customer: 'Client',
    bookings_price: 'Prix',
    bookings_deposit: 'Acompte',
    bookings_remaining: 'Restant',
    bookings_notes: 'Notes',
    
    // Customers
    customers_title: 'Clients',
    customers_name: 'Nom',
    customers_email: 'Email',
    customers_phone: 'Téléphone',
    customers_address: 'Adresse',
    customers_bookings: 'Réservations',
    customers_total_spent: 'Total dépensé',
    
    // Packages
    packages_title: 'Forfaits',
    packages_name: 'Nom du forfait',
    packages_description: 'Description',
    packages_price: 'Prix',
    packages_duration: 'Durée',
    packages_includes: 'Inclut',
    packages_features: 'Caractéristiques',
    
    // Team
    team_title: 'Équipe',
    team_name: 'Nom',
    team_role: 'Rôle',
    team_email: 'Email',
    team_phone: 'Téléphone',
    team_status: 'Statut',
    
    // Equipment
    equipment_title: 'Équipement',
    equipment_name: 'Nom',
    equipment_category: 'Catégorie',
    equipment_status: 'Statut',
    equipment_maintenance: 'Maintenance',
    
    // Reports
    reports_title: 'Rapports',
    reports_financial: 'Rapports financiers',
    reports_analytics: 'Analytiques',
    reports_export: 'Exporter',
    
    // Settings
    settings_title: 'Paramètres',
    settings_profile: 'Profil',
    settings_security: 'Sécurité',
    settings_notifications: 'Notifications',
    settings_language: 'Langue',
    settings_theme: 'Thème',
    settings_currency: 'Devise',
    
    // Messages
    msg_login_success: 'Connexion réussie',
    msg_login_error: 'Échec de la connexion',
    msg_save_success: 'Enregistré avec succès',
    msg_delete_success: 'Supprimé avec succès',
    msg_delete_error: 'Échec de la suppression',
    msg_confirm_delete: 'Êtes-vous sûr de vouloir supprimer?',
    msg_required_field: 'Ce champ est requis',
    msg_invalid_email: 'Adresse email invalide',
    msg_invalid_phone: 'Numéro de téléphone invalide',
  },
  es: {
    // Common
    home: 'Inicio',
    about: 'Acerca de',
    portfolio: 'Portafolio',
    packages: 'Paquetes',
    contact: 'Contacto',
    login: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    register: 'Registrarse',
    dashboard: 'Panel',
    settings: 'Configuración',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    loading: 'Cargando...',
    error: 'Ocurrió un error',
    success: 'Éxito',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    close: 'Cerrar',
    yes: 'Sí',
    no: 'No',
    
    // Navigation
    nav_home: 'Inicio',
    nav_about: 'Acerca de',
    nav_portfolio: 'Portafolio',
    nav_packages: 'Paquetes',
    nav_contact: 'Contacto',
    nav_login: 'Iniciar sesión',
    nav_register: 'Registrarse',
    
    // Dashboard
    dashboard_title: 'Panel',
    dashboard_overview: 'Resumen',
    dashboard_bookings: 'Reservas',
    dashboard_customers: 'Clientes',
    dashboard_revenue: 'Ingresos',
    dashboard_team: 'Equipo',
    dashboard_equipment: 'Equipo',
    
    // Bookings
    bookings_title: 'Reservas',
    bookings_new: 'Nueva reserva',
    bookings_view: 'Ver reserva',
    bookings_edit: 'Editar reserva',
    bookings_delete: 'Eliminar reserva',
    bookings_status: 'Estado',
    bookings_date: 'Fecha',
    bookings_time: 'Hora',
    bookings_package: 'Paquete',
    bookings_customer: 'Cliente',
    bookings_price: 'Precio',
    bookings_deposit: 'Depósito',
    bookings_remaining: 'Restante',
    bookings_notes: 'Notas',
    
    // Customers
    customers_title: 'Clientes',
    customers_name: 'Nombre',
    customers_email: 'Correo',
    customers_phone: 'Teléfono',
    customers_address: 'Dirección',
    customers_bookings: 'Reservas',
    customers_total_spent: 'Total gastado',
    
    // Packages
    packages_title: 'Paquetes',
    packages_name: 'Nombre del paquete',
    packages_description: 'Descripción',
    packages_price: 'Precio',
    packages_duration: 'Duración',
    packages_includes: 'Incluye',
    packages_features: 'Características',
    
    // Team
    team_title: 'Equipo',
    team_name: 'Nombre',
    team_role: 'Rol',
    team_email: 'Correo',
    team_phone: 'Teléfono',
    team_status: 'Estado',
    
    // Equipment
    equipment_title: 'Equipo',
    equipment_name: 'Nombre',
    equipment_category: 'Categoría',
    equipment_status: 'Estado',
    equipment_maintenance: 'Mantenimiento',
    
    // Reports
    reports_title: 'Reportes',
    reports_financial: 'Reportes financieros',
    reports_analytics: 'Analíticas',
    reports_export: 'Exportar',
    
    // Settings
    settings_title: 'Configuración',
    settings_profile: 'Perfil',
    settings_security: 'Seguridad',
    settings_notifications: 'Notificaciones',
    settings_language: 'Idioma',
    settings_theme: 'Tema',
    settings_currency: 'Moneda',
    
    // Messages
    msg_login_success: 'Inicio de sesión exitoso',
    msg_login_error: 'Error al iniciar sesión',
    msg_save_success: 'Guardado exitosamente',
    msg_delete_success: 'Eliminado exitosamente',
    msg_delete_error: 'Error al eliminar',
    msg_confirm_delete: '¿Estás seguro de eliminar?',
    msg_required_field: 'Este campo es requerido',
    msg_invalid_email: 'Correo inválido',
    msg_invalid_phone: 'Teléfono inválido',
  },
};

export class I18nService {
  private static currentLanguage: Language = 'ar';
  private static fallbackLanguage: Language = 'en';

  // Set language
  static setLanguage(language: Language): void {
    this.currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }

  // Get current language
  static getLanguage(): Language {
    return this.currentLanguage;
  }

  // Get translation
  static t(key: string, language?: Language): string {
    const lang = language || this.currentLanguage;
    const keys = key.split('.');
    let value: any = translations[lang];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to fallback language
        value = translations[this.fallbackLanguage];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  }

  // Get translation with parameters
  static tWithParams(key: string, params: Record<string, string>, language?: Language): string {
    let translation = this.t(key, language);

    for (const [param, value] of Object.entries(params)) {
      translation = translation.replace(`{{${param}}}`, value);
    }

    return translation;
  }

  // Initialize
  static initialize(): void {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && translations[savedLanguage]) {
      this.setLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0] as Language;
      if (translations[browserLang]) {
        this.setLanguage(browserLang);
      } else {
        this.setLanguage('ar'); // Default to Arabic
      }
    }
  }

  // Get available languages
  static getAvailableLanguages(): { code: Language; name: string }[] {
    return [
      { code: 'ar', name: 'العربية' },
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' },
      { code: 'es', name: 'Español' },
    ];
  }

  // Format date according to locale
  static formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const locale = this.getLocale();
    return date.toLocaleDateString(locale, options);
  }

  // Format number according to locale
  static formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const locale = this.getLocale();
    return number.toLocaleString(locale, options);
  }

  // Get locale string
  private static getLocale(): string {
    const localeMap: Record<Language, string> = {
      ar: 'ar-EG',
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
    };
    return localeMap[this.currentLanguage];
  }

  // Check if RTL
  static isRTL(): boolean {
    return this.currentLanguage === 'ar';
  }
}

export const i18n = I18nService;
