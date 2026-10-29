import { describe, it, expect, vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
const { attachmentPath, attachmentName } = await import('./messageAttachments');

describe('attachmentPath', () => {
  it('garde un chemin tel quel', () => {
    expect(attachmentPath('user-1/1730000000000-contrat.pdf')).toBe('user-1/1730000000000-contrat.pdf');
  });
  it("extrait le chemin d'une ancienne URL publique", () => {
    expect(attachmentPath('https://x.supabase.co/storage/v1/object/public/message-attachments/1730000000000-Mon%20CV.pdf'))
      .toBe('1730000000000-Mon CV.pdf');
  });
});

describe('attachmentName', () => {
  it("retire l'horodatage", () => {
    expect(attachmentName('user-1/1730000000000-contrat.pdf')).toBe('contrat.pdf');
    expect(attachmentName('https://x.supabase.co/storage/v1/object/public/message-attachments/1730000000000-Mon%20CV.pdf')).toBe('Mon CV.pdf');
  });
});
