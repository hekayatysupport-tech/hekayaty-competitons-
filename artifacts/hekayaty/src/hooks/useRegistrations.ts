import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type Category = 'رومانسية' | 'إثارة وتشويق' | 'فانتازيا' | 'واقعية' | 'تاريخية' | 'رعب';
export type RegistrationStatus = 
  | 'Registration Started'
  | 'Information Completed'
  | 'Waiting For Payment'
  | 'Payment Submitted'
  | 'Payment Verified'
  | 'Waiting For Novel Upload'
  | 'Novel Uploaded'
  | 'Sent To Telegram'
  | 'Submission Completed'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Attention';

export type PackageType = 'package_a' | 'package_b';

export interface Story {
  id?: string;
  title: string;
  category: Category;
  description?: string;
  upload_status?: string;
  telegram_delivery_status?: string;
  file_name?: string;
  file_size?: number;
}

export interface Registration {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  penName?: string;
  packageType: PackageType;
  stories: Story[];
  registrationStatus: RegistrationStatus;
  paymentStatus?: string; // Keep for legacy if needed
  registeredAt: string;
  paymentProofUrl?: string;
  paymentReference?: string;
  adminNotes?: string;
}

export interface PendingRegistration {
  name: string;
  email: string;
  phone: string;
  city: string;
  penName?: string;
  packageType: PackageType;
  stories: Story[];
}

export function useRegistrations() {
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

  const completeRegistration = async (): Promise<Registration | null> => {
    const pending = getPending();
    if (!pending) return null;

    try {
      // Direct call to our Supabase RPC function that handles the transaction safely
      const { data, error } = await supabase.rpc('complete_registration', {
        p_name: pending.name,
        p_email: pending.email,
        p_phone: pending.phone,
        p_city: pending.city,
        p_pen_name: pending.penName || null,
        p_package_type: pending.packageType,
        p_stories: pending.stories,
        p_edition_year: '2026'
      });

      if (error) {
        console.error('Supabase error:', error);
        toast.error('حدث خطأ أثناء التسجيل.');
        return null;
      }

      clearPending();
      
      return {
        id: data.registration_id,
        code: data.code,
        ...pending,
        registrationStatus: 'Payment Submitted',
        registeredAt: new Date().toISOString()
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const getByCode = async (code: string): Promise<Registration | null> => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id, code, registration_status, payment_status, registered_at, package_type, admin_notes,
          writers (name, email, phone, city, pen_name),
          stories (id, title, category, description, upload_status, telegram_delivery_status, file_name, file_size),
          payments (proof_type, proof_data)
        `)
        .eq('code', code)
        .single();
        
      if (error || !data) return null;
      
      const writer = Array.isArray(data.writers) ? data.writers[0] : data.writers;
      const payment = Array.isArray(data.payments) ? data.payments[0] : data.payments;
      const storiesArray = Array.isArray(data.stories) ? data.stories : (data.stories ? [data.stories] : []);

      return {
        id: data.id,
        code: data.code,
        name: writer.name,
        email: writer.email,
        phone: writer.phone,
        city: writer.city,
        penName: writer.pen_name,
        packageType: data.package_type as PackageType,
        stories: storiesArray.map((s: any) => ({
          id: s.id,
          title: s.title,
          category: s.category as Category,
          description: s.description,
          upload_status: s.upload_status,
          telegram_delivery_status: s.telegram_delivery_status,
          file_name: s.file_name,
          file_size: s.file_size
        })),
        registrationStatus: data.registration_status as RegistrationStatus,
        paymentStatus: data.payment_status,
        registeredAt: data.registered_at,
        adminNotes: data.admin_notes,
        paymentProofUrl: payment?.proof_type === 'screenshot' ? payment.proof_data : undefined,
        paymentReference: payment?.proof_type === 'reference' ? payment.proof_data : undefined,
      };
    } catch (e) {
      return null;
    }
  };

  const getRegistrations = async (): Promise<Registration[]> => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          id, code, registration_status, payment_status, registered_at, package_type, admin_notes,
          writers (name, email, phone, city, pen_name),
          stories (id, title, category, description, upload_status, telegram_delivery_status, file_name, file_size),
          payments (proof_type, proof_data)
        `)
        .order('registered_at', { ascending: false });
        
      if (error || !data) return [];
      
      return data.map((d: any) => {
        const writer = Array.isArray(d.writers) ? d.writers[0] : d.writers;
        const payment = Array.isArray(d.payments) ? d.payments[0] : d.payments;
        const storiesArray = Array.isArray(d.stories) ? d.stories : (d.stories ? [d.stories] : []);
        
        return {
          id: d.id,
          code: d.code,
          name: writer.name,
          email: writer.email,
          phone: writer.phone,
          city: writer.city,
          penName: writer.pen_name,
          packageType: d.package_type as PackageType,
          stories: storiesArray.map((s: any) => ({
            id: s.id,
            title: s.title,
            category: s.category as Category,
            description: s.description,
            upload_status: s.upload_status,
            telegram_delivery_status: s.telegram_delivery_status,
            file_name: s.file_name,
            file_size: s.file_size
          })),
          registrationStatus: d.registration_status as RegistrationStatus,
          paymentStatus: d.payment_status,
          registeredAt: d.registered_at,
          adminNotes: d.admin_notes,
          paymentProofUrl: payment?.proof_type === 'screenshot' ? payment.proof_data : undefined,
          paymentReference: payment?.proof_type === 'reference' ? payment.proof_data : undefined,
        };
      });
    } catch (e) {
      return [];
    }
  };

  const updateStatus = async (code: string, status: RegistrationStatus, adminNotes?: string) => {
    try {
      // 1. Update registration status and notes
      const updateData: any = { registration_status: status };
      if (adminNotes !== undefined) {
        updateData.admin_notes = adminNotes;
      }
      
      const { error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('code', code);
        
      if (error) {
         console.error("Error updating registration status:", error);
         return false;
      }

      // 2. Also update payment status if it matches legacy
      let paymentStatusVal = '';
      if (status === 'Payment Verified' || status === 'Waiting For Novel Upload') paymentStatusVal = 'verified';
      else if (status === 'Waiting For Payment') paymentStatusVal = 'rejected';
      else paymentStatusVal = 'pending';

      const { data: regData } = await supabase.from('registrations').select('id').eq('code', code).single();
      if (regData) {
        await supabase
          .from('payments')
          .update({ status: paymentStatusVal })
          .eq('registration_id', regData.id);
          
        await supabase
          .from('registrations')
          .update({ payment_status: paymentStatusVal })
          .eq('id', regData.id);
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const submitPaymentProof = async (code: string, type: 'screenshot' | 'reference', data: string) => {
    try {
      // Use SECURITY DEFINER RPC to bypass RLS on the payments table
      const { data: result, error } = await supabase.rpc('submit_payment_proof', {
        p_code: code,
        p_proof_type: type,
        p_proof_data: data
      });

      if (error) {
        console.error("Error submitting proof via RPC:", error);
        return false;
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };


  const seedFakeData = () => {
    // Deprecated for production
  };

  return {
    getRegistrations,
    getPending,
    setPending,
    clearPending,
    completeRegistration,
    getByCode,
    updateStatus,
    submitPaymentProof,
    seedFakeData
  };
}
