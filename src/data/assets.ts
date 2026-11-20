// Client-only image URLs generated via generate_image (do not import in server.ts)
export const HERO_LORENCIA_IMAGE = '/src/assets/images/hero_lorencia_citadel_1795147373950.jpg';

export const CLASS_PORTRAITS: Record<number, string> = {
  16: '/src/assets/images/class_dark_knight_1795147385702.jpg',
  17: '/src/assets/images/class_dark_knight_1795147385702.jpg',
  18: '/src/assets/images/class_dark_knight_1795147385702.jpg',
  0: '/src/assets/images/class_dark_wizard_1795147374607.jpg',
  1: '/src/assets/images/class_dark_wizard_1795147374607.jpg',
  2: '/src/assets/images/class_dark_wizard_1795147374607.jpg',
  32: '/src/assets/images/class_fairy_elf_1795147380688.jpg',
  33: '/src/assets/images/class_fairy_elf_1795147380688.jpg',
  34: '/src/assets/images/class_fairy_elf_1795147380688.jpg',
  48: '/src/assets/images/class_magic_gladiator_1795147375733.jpg',
  49: '/src/assets/images/class_magic_gladiator_1795147375733.jpg',
};

export function getClassPortrait(classId: number): string {
  return CLASS_PORTRAITS[classId] || CLASS_PORTRAITS[16];
}
