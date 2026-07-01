import dayjs from 'dayjs';
import 'dayjs/locale/ar';

// Set Arabic locale
dayjs.locale('ar');

export const formatDate = (date: Date | string, format = 'DD MMMM YYYY') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: Date | string) => {
  return dayjs(date).format('DD MMMM YYYY HH:mm');
};

export const formatTime = (date: Date | string) => {
  return dayjs(date).format('HH:mm');
};

export const isToday = (date: Date | string) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

export const isThisWeek = (date: Date | string) => {
  return dayjs(date).isSame(dayjs(), 'week');
};

export const isThisMonth = (date: Date | string) => {
  return dayjs(date).isSame(dayjs(), 'month');
};

export const getStartOfMonth = (date?: Date | string) => {
  return dayjs(date).startOf('month').toDate();
};

export const getEndOfMonth = (date?: Date | string) => {
  return dayjs(date).endOf('month').toDate();
};

export const getStartOfWeek = (date?: Date | string) => {
  return dayjs(date).startOf('week').toDate();
};

export const getEndOfWeek = (date?: Date | string) => {
  return dayjs(date).endOf('week').toDate();
};

export const addDays = (date: Date | string, days: number) => {
  return dayjs(date).add(days, 'day').toDate();
};

export const subtractDays = (date: Date | string, days: number) => {
  return dayjs(date).subtract(days, 'day').toDate();
};

export const getDaysDiff = (date1: Date | string, date2: Date | string) => {
  return dayjs(date1).diff(dayjs(date2), 'day');
};
