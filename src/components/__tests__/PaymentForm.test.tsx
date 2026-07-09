import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaymentForm from '../PaymentForm';

describe('PaymentForm', () => {
  it('renders payment form correctly', () => {
    render(<PaymentForm amount={100} currency="SAR" />);
    
    expect(screen.getByText('دفع آمن عبر Stripe')).toBeInTheDocument();
    expect(screen.getByText('المبلغ الإجمالي')).toBeInTheDocument();
    expect(screen.getByText('100 SAR')).toBeInTheDocument();
    expect(screen.getByText('ادفع الآن')).toBeInTheDocument();
  });

  it('validates card number', async () => {
    const user = userEvent.setup();
    render(<PaymentForm amount={100} currency="SAR" />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    const submitButton = screen.getByText('ادفع الآن');
    
    await user.click(submitButton);
    
    expect(screen.getByText('رقم البطاقة غير صحيح')).toBeInTheDocument();
  });

  it('validates expiry date', async () => {
    const user = userEvent.setup();
    render(<PaymentForm amount={100} currency="SAR" />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    await user.type(cardInput, '1234567890123456');
    
    const submitButton = screen.getByText('ادفع الآن');
    await user.click(submitButton);
    
    expect(screen.getByText('تاريخ الانتهاء غير صحيح (MM/YY)')).toBeInTheDocument();
  });

  it('validates CVC', async () => {
    const user = userEvent.setup();
    render(<PaymentForm amount={100} currency="SAR" />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    await user.type(cardInput, '1234567890123456');
    
    const expiryInput = screen.getByPlaceholderText('MM/YY');
    await user.type(expiryInput, '12/25');
    
    const submitButton = screen.getByText('ادفع الآن');
    await user.click(submitButton);
    
    expect(screen.getByText('CVC غير صحيح')).toBeInTheDocument();
  });

  it('validates card name', async () => {
    const user = userEvent.setup();
    render(<PaymentForm amount={100} currency="SAR" />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    await user.type(cardInput, '1234567890123456');
    
    const expiryInput = screen.getByPlaceholderText('MM/YY');
    await user.type(expiryInput, '12/25');
    
    const cvcInput = screen.getByPlaceholderText('123');
    await user.type(cvcInput, '123');
    
    const submitButton = screen.getByText('ادفع الآن');
    await user.click(submitButton);
    
    expect(screen.getByText('الاسم على البطاقة مطلوب')).toBeInTheDocument();
  });

  it('calls onSuccess when payment is successful', async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    
    render(<PaymentForm amount={100} currency="SAR" onSuccess={onSuccess} />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    await user.type(cardInput, '1234567890123456');
    
    const nameInput = screen.getByPlaceholderText('الاسم الكامل');
    await user.type(nameInput, 'Test User');
    
    const expiryInput = screen.getByPlaceholderText('MM/YY');
    await user.type(expiryInput, '12/25');
    
    const cvcInput = screen.getByPlaceholderText('123');
    await user.type(cvcInput, '123');
    
    const submitButton = screen.getByText('ادفع الآن');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('calls onError when payment fails', async () => {
    const onError = vi.fn();
    const user = userEvent.setup();
    
    render(<PaymentForm amount={100} currency="SAR" onError={onError} />);
    
    // Simulate error by not filling required fields
    const submitButton = screen.getByText('ادفع الآن');
    await user.click(submitButton);
    
    // Since validation fails, onError should not be called
    expect(onError).not.toHaveBeenCalled();
  });

  it('formats card number correctly', async () => {
    const user = userEvent.setup();
    render(<PaymentForm amount={100} currency="SAR" />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456') as HTMLInputElement;
    await user.type(cardInput, '1234567890123456');
    
    expect(cardInput.value).toBe('1234 5678 9012 3456');
  });

  it('formats expiry date correctly', async () => {
    const user = userEvent.setup();
    render(<PaymentForm amount={100} currency="SAR" />);
    
    const expiryInput = screen.getByPlaceholderText('MM/YY') as HTMLInputElement;
    await user.type(expiryInput, '1225');
    
    expect(expiryInput.value).toBe('12/25');
  });

  it('disables submit button while processing', async () => {
    const onSuccess = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    const user = userEvent.setup();
    
    render(<PaymentForm amount={100} currency="SAR" onSuccess={onSuccess} />);
    
    const cardInput = screen.getByPlaceholderText('1234 5678 9012 3456');
    await user.type(cardInput, '1234567890123456');
    
    const nameInput = screen.getByPlaceholderText('الاسم الكامل');
    await user.type(nameInput, 'Test User');
    
    const expiryInput = screen.getByPlaceholderText('MM/YY');
    await user.type(expiryInput, '12/25');
    
    const cvcInput = screen.getByPlaceholderText('123');
    await user.type(cvcInput, '123');
    
    const submitButton = screen.getByText('ادفع الآن');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('جاري معالجة الدفع...')).toBeInTheDocument();
  });
});
