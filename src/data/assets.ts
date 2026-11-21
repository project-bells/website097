// Client-only image URLs (do not import in server.ts)
export const HERO_LORENCIA_IMAGE = '/src/assets/images/hero_lorencia_citadel_1795147373950.jpg';

export const CLASS_PORTRAITS: Record<number, string> = {
  16: '/assets/aistudio/knight_0cc2a7b3.jpe',
  17: '/assets/aistudio/knight_0cc2a7b3.jpe',
  18: '/assets/aistudio/knight_0cc2a7b3.jpe',
  0: '/assets/aistudio/Wiz_f22e7893.jpe',
  1: '/assets/aistudio/Wiz_f22e7893.jpe',
  2: '/assets/aistudio/Wiz_f22e7893.jpe',
  32: '/assets/aistudio/elf_90906900.jpe',
  33: '/assets/aistudio/elf_90906900.jpe',
  34: '/assets/aistudio/elf_90906900.jpe',
  48: '/assets/aistudio/Magic_a49a9263.jpe',
  49: '/assets/aistudio/Magic_a49a9263.jpe',
};

export function getClassPortrait(classId: number): string {
  return CLASS_PORTRAITS[classId] || CLASS_PORTRAITS[16];
}
