export interface CarouselSlideRaw {
  id: number;
  sort: number | null;
  is_featured: boolean;
  title: string;
  description: string | null;
  button_function: string | null;
  img_mobile: string;
  img_tablet: string;
  img_desktop: string;
  // Color de escritorio (≥1024px). Mantiene los nombres originales.
  title_color_preset: string | null;
  title_color_custom: string | null;
  description_color_preset: string | null;
  description_color_custom: string | null;
  // Override opcional para tablet/móvil (<1024px). Si va vacío, hereda el de escritorio.
  title_color_preset_mobile: string | null;
  title_color_custom_mobile: string | null;
  description_color_preset_mobile: string | null;
  description_color_custom_mobile: string | null;
  // Contorno del título. Si title_outline es true, el título se renderiza con
  // relleno paco-cream y contorno del color resuelto (custom > preset > paco-orange).
  // Un solo color de outline (sin override por breakpoint; el grosor lo gestiona el CSS).
  title_outline: boolean;
  title_outline_color_preset: string | null;
  title_outline_color_custom: string | null;
}

export interface CarouselSlide {
  id: number;
  sort: number | null;
  is_featured: boolean;
  title: string;
  description: string | null;
  button_function: string | null;
  img_mobile: string;
  img_tablet: string;
  img_desktop: string;
  // Colores ya resueltos (nunca null). El frontend aplica desktop en ≥1024px y
  // mobile en <1024px; mobile cae a desktop si no hay override.
  title_color_desktop: string;
  title_color_mobile: string;
  description_color_desktop: string;
  description_color_mobile: string;
  // Contorno del título ya resuelto. Si title_outline es true, el render usa
  // title_outline_color como color de contorno (nunca null: cae a paco-orange).
  title_outline: boolean;
  title_outline_color: string;
}
