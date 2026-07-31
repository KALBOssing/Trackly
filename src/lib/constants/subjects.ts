// Fixed subject catalog for the lesson "Subject" dropdown. Kept as a plain
// list rather than a database table since it changes rarely and every
// teacher shares the same options.
export const SUBJECTS = [
  "English",
  "Filipino",
  "Mathematics",
  "Science",
  "Araling Panlipunan",
  "Edukasyon sa Pagpapakatao (ESP)",
  "MAPEH",
  "Technology and Livelihood Education (TLE)",
  "Research",
  "Homeroom / Advisory",
  "Other",
] as const;
