import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type Category = 'رومانسية' | 'إثارة وتشويق' | 'فانتازيا' | 'واقعية' | 'تاريخية' | 'رعب';
export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export interface Registration {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  penName?: string;
  storyName: string;
  category: Category;
  paymentStatus: PaymentStatus;
  registeredAt: string;
}

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  city: string;
  penName?: string;
  storyName: string;
  category: Category;
}

export function useRegistrations() {
  const getRegistrations = (): Registration[] => {
    try {
      return JSON.parse(localStorage.getItem('hekayaty_registrations') || '[]');
    } catch {
      return [];
    }
  };

  const setRegistrations = (regs: Registration[]) => {
    localStorage.setItem('hekayaty_registrations', JSON.stringify(regs));
  };

  const getPending = (): PendingRegistration | null => {
    try {
      return JSON.parse(localStorage.getItem('hekayaty_pending_registration') || 'null');
    } catch {
      return null;
    }
  };

  const setPending = (data: PendingRegistration) => {
    localStorage.setItem('hekayaty_pending_registration', JSON.stringify(data));
  };

  const clearPending = () => {
    localStorage.removeItem('hekayaty_pending_registration');
  };

  const completeRegistration = (): Registration | null => {
    const pending = getPending();
    if (!pending) return null;

    let counter = parseInt(localStorage.getItem('hekayaty_counter') || '1', 10);
    const code = `HKA-2026-${String(counter).padStart(4, '0')}`;
    counter += 1;
    localStorage.setItem('hekayaty_counter', counter.toString());

    const newReg: Registration = {
      id: uuidv4(),
      code,
      ...pending,
      paymentStatus: 'pending',
      registeredAt: new Date().toISOString()
    };

    const regs = getRegistrations();
    setRegistrations([...regs, newReg]);
    clearPending();

    return newReg;
  };

  const getByCode = (code: string) => {
    return getRegistrations().find(r => r.code === code) || null;
  };

  const updateStatus = (code: string, status: PaymentStatus) => {
    const regs = getRegistrations();
    const index = regs.findIndex(r => r.code === code);
    if (index !== -1) {
      regs[index].paymentStatus = status;
      setRegistrations(regs);
    }
  };

  const seedFakeData = () => {
    const regs = getRegistrations();
    if (regs.length === 0) {
      const fakes: Registration[] = [
        { id: uuidv4(), code: 'HKA-2026-0001', name: 'أحمد محمود', email: 'ahmed@example.com', phone: '01012345678', city: 'القاهرة', storyName: 'رمال الزمن', category: 'تاريخية', paymentStatus: 'verified', registeredAt: new Date(Date.now() - 86400000).toISOString() },
        { id: uuidv4(), code: 'HKA-2026-0002', name: 'سارة خالد', email: 'sara@example.com', phone: '01112345678', city: 'الإسكندرية', storyName: 'ظلال الماضي', category: 'رعب', paymentStatus: 'pending', registeredAt: new Date().toISOString() },
        { id: uuidv4(), code: 'HKA-2026-0003', name: 'محمود حسن', email: 'm.hassan@example.com', phone: '01212345678', city: 'المنصورة', storyName: 'مدينة الأضواء', category: 'فانتازيا', paymentStatus: 'rejected', registeredAt: new Date(Date.now() - 172800000).toISOString() },
      ];
      setRegistrations(fakes);
      localStorage.setItem('hekayaty_counter', '4');
    }
  };

  return {
    getRegistrations,
    setRegistrations,
    getPending,
    setPending,
    clearPending,
    completeRegistration,
    getByCode,
    updateStatus,
    seedFakeData
  };
}
