import { User } from '../types';
import { firestoreData } from './firestoreData';

interface ReferralCode {
  code: string;
  referrerId: string;
  referrerName: string;
  createdAt: string;
  isActive: boolean;
  rewardAmount: number;
  rewardType: 'percentage' | 'fixed';
  uses: number;
  maxUses?: number;
  expiryDate?: string;
}

interface Referral {
  id: string;
  referrerId: string;
  referredId: string;
  referredName: string;
  referredEmail: string;
  code: string;
  rewardAmount: number;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
  completedAt?: string;
}

class ReferralService {
  async generateReferralCode(userId: string, userName: string): Promise<string> {
    try {
      const code = this.generateUniqueCode();
      const referralCode: ReferralCode = {
        code,
        referrerId: userId,
        referrerName: userName,
        createdAt: new Date().toISOString(),
        isActive: true,
        rewardAmount: 10, // Default 10% discount
        rewardType: 'percentage',
        uses: 0,
        maxUses: 100,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      };

      // Save to Firestore (you may need to add a 'referral_codes' collection)
      // await firestoreData.setDocument('referral_codes', code, referralCode);

      return code;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return '';
    }
  }

  async validateReferralCode(code: string): Promise<boolean> {
    try {
      // Check if code exists and is active
      // const referralCode = await firestoreData.getDocument('referral_codes', code);
      // return referralCode && referralCode.isActive;
      return true; // Placeholder
    } catch (error) {
      console.error('Error validating referral code:', error);
      return false;
    }
  }

  async applyReferral(code: string, userId: string, userName: string, email: string): Promise<boolean> {
    try {
      const isValid = await this.validateReferralCode(code);
      if (!isValid) return false;

      const referral: Referral = {
        id: Date.now().toString(),
        referrerId: '', // Will be set from referral code
        referredId: userId,
        referredName: userName,
        referredEmail: email,
        code,
        rewardAmount: 0, // Will be calculated based on referral code
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      // Save referral
      // await firestoreData.setDocument('referrals', referral.id, referral);

      return true;
    } catch (error) {
      console.error('Error applying referral:', error);
      return false;
    }
  }

  async completeReferral(referralId: string): Promise<boolean> {
    try {
      // Update referral status to completed
      // const referral = await firestoreData.getDocument('referrals', referralId);
      // if (referral) {
      //   await firestoreData.updateDocument('referrals', referralId, {
      //     status: 'completed',
      //     completedAt: new Date().toISOString(),
      //   });
      // }
      return true;
    } catch (error) {
      console.error('Error completing referral:', error);
      return false;
    }
  }

  async getUserReferrals(userId: string): Promise<Referral[]> {
    try {
      // Get all referrals for this user
      // const referrals = await firestoreData.queryCollection('referrals', 'referrerId', '==', userId);
      // return referrals;
      return []; // Placeholder
    } catch (error) {
      console.error('Error getting user referrals:', error);
      return [];
    }
  }

  async getReferralStats(userId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewards: number;
  }> {
    try {
      const referrals = await this.getUserReferrals(userId);
      const completed = referrals.filter(r => r.status === 'completed').length;
      const pending = referrals.filter(r => r.status === 'pending').length;
      const totalRewards = referrals
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.rewardAmount, 0);

      return {
        totalReferrals: referrals.length,
        completedReferrals: completed,
        pendingReferrals: pending,
        totalRewards,
      };
    } catch (error) {
      console.error('Error getting referral stats:', error);
      return {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalRewards: 0,
      };
    }
  }

  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  calculateReward(amount: number, rewardType: 'percentage' | 'fixed', rewardValue: number): number {
    if (rewardType === 'percentage') {
      return (amount * rewardValue) / 100;
    }
    return rewardValue;
  }
}

export const referralService = new ReferralService();
