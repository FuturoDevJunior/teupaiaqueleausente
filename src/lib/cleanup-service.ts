
import { supabase } from "@/integrations/supabase/client";

/**
 * Service for cleaning up expired temporary emails
 */
export const cleanupService = {
  /**
   * Mark expired temporary emails as deleted
   */
  async markExpiredAsDeleted() {
    const { error } = await supabase.rpc('cleanup_expired_emails');
    
    if (error) {
      console.error('Error cleaning up expired emails:', error);
      return { success: false, error };
    }
    
    return { success: true };
  },
  
  /**
   * Get statistics about temporary emails
   */
  async getStats() {
    const { data, error } = await supabase
      .from('temp_emails')
      .select('*', { count: 'exact' });
      
    if (error) {
      console.error('Error getting email statistics:', error);
      return { success: false, error };
    }
    
    const total = data?.length || 0;
    const active = data?.filter(email => !email.deleted)?.length || 0;
    const deleted = total - active;
    
    return { 
      success: true, 
      stats: { total, active, deleted } 
    };
  }
};
