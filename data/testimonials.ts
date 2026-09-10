export interface Testimonial {
  boutiqueName: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
}

// Intentionally empty. Do not fill this with placeholder or fabricated
// quotes — add real entries here (or migrate to a `testimonials` table
// once it exists, see db/migrations) only as genuine customer
// testimonials come in. components/Testimonials.tsx renders an honest empty
// state when this array is empty, and Home omits the section entirely.
export const TESTIMONIALS: Testimonial[] = [];
