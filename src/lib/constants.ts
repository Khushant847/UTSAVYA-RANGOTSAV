export const EVENT = {
  name: "UTSAVYA RANGOTSAV",
  tagline: "Har Pal, Ek Utsav",
  date: "2026-10-17",
  time: "5:30 PM onwards",
  venue: {
    name: "Seema Trikha Residence",
    address: "21B, Faridabad, 121001",
  },
  organizer: "UTSAVYA CELEBRATION",
  instagram: "@utsavya.celebration",
  email: "utsavyacelebration@gmail.com",
  description:
    "A vibrant evening of Garba, Dandiya, music, entertainment, games, food, celebration and unforgettable festive moments.",
} as const;

export const PASS_TYPES = {
  single: {
    id: "single",
    name: "SINGLE PASS",
    price: 24900,
    entries: 1,
    label: "Entry for 1 person",
    badge: null,
  },
  duo: {
    id: "duo",
    name: "DUO PASS",
    price: 44900,
    entries: 2,
    label: "Entry for 2 people",
    badge: "POPULAR",
  },
  family: {
    id: "family",
    name: "FAMILY / GROUP PASS",
    price: 99900,
    entries: 5,
    label: "Entry for 5 people",
    badge: "BEST VALUE",
  },
} as const;

export type PassTypeId = keyof typeof PASS_TYPES;

export const COLLECTIONS = {
  tickets: "tickets",
  payments: "payments",
  scanLogs: "scanLogs",
  admins: "admins",
} as const;
