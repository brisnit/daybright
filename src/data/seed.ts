import type {
  AutomationRule,
  BrandVoice,
  Business,
  Customer,
  DemoState,
  Send,
  SendDraft,
} from "@/lib/types";
import { VOICE_PRESETS } from "@/lib/ai/voice";
import { STUDIO_EXAMPLES } from "@/lib/cards";

export const STATE_VERSION = 3;

const DAY = 86_400_000;

/** Month/day for a birthday `offset` days from today (negative = already passed). */
function bd(offset: number) {
  const d = new Date(Date.now() + offset * DAY);
  return { birthMonth: d.getMonth() + 1, birthDay: d.getDate() };
}

function at(offsetDays: number, hour = 9, minute = 0) {
  const d = new Date(Date.now() + offsetDays * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

const thisYear = new Date().getFullYear();

export const DEFAULT_VOICE: BrandVoice = {
  ...VOICE_PRESETS.neighborly.voice,
};

export const SEED_BUSINESS: Business = {
  name: "Harbor & Pine Realty",
  logoDataUrl: null,
  brandColor: "#1F5C4A",
  senderName: "Maya Okafor",
  signature: "Maya & the Harbor & Pine team",
  defaultMessage:
    "Happy birthday, {{first_name}}! Thinking of you today and hoping the year ahead feels just like home. Warmly, {{sender_name}} at {{company_name}}",
  defaultCardId: "garden-arch",
  timezone: "America/Chicago",
  voice: DEFAULT_VOICE,
};

type CSeed = Omit<Customer, "createdAt" | "history" | "cardPreference" | "giftPreference" | "birthYear" | "tags" | "interests" | "notes" | "company"> &
  Partial<Customer>;

function cust(c: CSeed): Customer {
  return {
    birthYear: null,
    company: "",
    tags: [],
    notes: "",
    interests: [],
    cardPreference: null,
    giftPreference: "gift-ok",
    createdAt: at(-400),
    history: [],
    ...c,
  };
}

export function seedCustomers(): Customer[] {
  return [
    cust({
      id: "c-rosa", firstName: "Rosa", lastName: "Delgado", email: "rosa.delgado@example.com", ...bd(3),
      tags: ["VIP", "Past client"], interests: ["gardening"], company: "",
      notes: "Bought her first home with us in 2019. Talks about her tomato beds every time we see her.",
      history: [
        { year: thisYear - 1, cardId: "wildflower-row", message: "Happy birthday, Rosa! Hope your garden is as happy as you've made us. Warmly, Maya" },
        { year: thisYear - 2, cardId: "garden-arch", message: "Happy birthday, Rosa! Wishing you a wonderful year in the new place. Maya at Harbor & Pine" },
      ],
    }),
    cust({
      id: "c-marcus", firstName: "Marcus", lastName: "Bell", email: "marcus@bellandsons.example", ...bd(5), birthYear: 1978,
      tags: ["VIP", "Referral partner"], interests: ["hiking"], company: "Bell & Sons Builders",
      notes: "Longtime client, loves hiking, helped us launch our business.",
      history: [{ year: thisYear - 1, cardId: "midnight-sparkler", message: "Happy birthday, Marcus! Thank you for everything. Maya" }],
    }),
    cust({
      id: "c-priya", firstName: "Priya", lastName: "Raman", email: "priya.raman@example.com", ...bd(6),
      tags: ["Past client"], interests: ["coffee", "books"],
      notes: "Sold her condo in 2023. Always has a book recommendation.",
    }),
    cust({
      id: "c-grace", firstName: "Grace", lastName: "Kim", email: "grace.kim@example.com", ...bd(9),
      tags: ["Past client"], interests: ["cooking"], notes: "Hosts a big dinner every Friday.",
    }),
    cust({
      id: "c-tom", firstName: "Tom", lastName: "Whitaker", email: "tom.whitaker@example.com", ...bd(12),
      tags: ["Past client"], notes: "",
      history: [{ year: thisYear - 1, cardId: "candle-glow", message: "Happy birthday, Tom! Wishing you a great year ahead. Maya at Harbor & Pine" }],
    }),
    cust({
      id: "c-ben", firstName: "Ben", lastName: "Asante", email: "ben.asante@example.com", ...bd(14),
      tags: ["Past client"], interests: ["golf", "dogs"], notes: "Has a golden retriever named Biscuit.",
    }),
    cust({
      id: "c-diego", firstName: "Diego", lastName: "Fuentes", email: "diego@fuentesholdings.example", ...bd(18),
      tags: ["Investor"], company: "Fuentes Holdings", giftPreference: "card-only",
      notes: "Prefers card only. Owns three rentals with us.",
    }),
    cust({
      id: "c-chloe", firstName: "Chloe", lastName: "Martin", email: "", ...bd(20),
      tags: ["Prospect"], notes: "Met at the spring open house. Need her email.",
    }),
    cust({
      id: "c-jamal", firstName: "Jamal", lastName: "Wright", email: "jamal.wright@example.com", ...bd(22),
      tags: ["VIP"], interests: ["music"], notes: "Plays bass in a weekend band.",
    }),
    cust({
      id: "c-noah", firstName: "Noah", lastName: "Patel", email: "noah.patel@example.com", ...bd(25),
      tags: ["Past client"], interests: ["cycling"],
    }),
    cust({
      id: "c-lucy", firstName: "Lucy", lastName: "Brennan", email: "lucy.b@example.com", ...bd(27),
      tags: ["Past client"], interests: ["dogs"], notes: "Two rescue greyhounds.",
    }),
    cust({
      id: "c-wei", firstName: "Wei", lastName: "Zhang", email: "wei.zhang@example.com", ...bd(29),
      tags: ["Investor"], interests: ["photography"], company: "Lumen Studio",
    }),
    cust({
      id: "c-hannah", firstName: "Hannah", lastName: "Cho", email: "hannah.cho@example.com",
      birthMonth: null, birthDay: null, tags: ["Past client"], notes: "Closed on the Elm St. bungalow in June.",
    }),
    cust({
      id: "c-nina", firstName: "Nina", lastName: "Kowalski", email: "nina.k@example.com",
      birthMonth: null, birthDay: null, tags: ["Prospect"],
    }),
    cust({
      id: "c-owen", firstName: "Owen", lastName: "Fitzgerald", email: "owen.fitz@example.com",
      birthMonth: null, birthDay: null, tags: ["Referral partner"], company: "Fitzgerald Mortgage",
    }),
    cust({
      id: "c-elena", firstName: "Elena", lastName: "Petrova", email: "elena.petrova@example.com",
      birthMonth: 2, birthDay: 29, tags: ["Past client"], interests: ["travel"], notes: "Leap-day birthday.",
    }),
    cust({
      id: "c-sam", firstName: "Sam", lastName: "O'Neill", email: "sam.oneill@example.com", ...bd(-4),
      tags: ["New client"], createdAt: at(-1), notes: "Added after this year's birthday had already passed.",
    }),
    cust({
      id: "c-ava", firstName: "Ava", lastName: "Thompson", email: "ava.t@example.com", ...bd(-10),
      tags: ["Past client"], interests: ["reading"],
    }),
    cust({
      id: "c-isaac", firstName: "Isaac", lastName: "Moreno", email: "isaac.moreno@example.com", ...bd(-6),
      tags: ["VIP"], interests: ["coffee"],
    }),
    cust({
      id: "c-fatima", firstName: "Fatima", lastName: "Hassan", email: "fatima.h@example.com", ...bd(-3),
      tags: ["VIP"], interests: ["flowers"],
    }),
    cust({
      id: "c-henry", firstName: "Henry", lastName: "Lewis", email: "henry.lewis@exmaple.com", ...bd(-1),
      tags: ["Past client"], notes: "",
    }),
    cust({
      id: "c-carlos", firstName: "Carlos", lastName: "Vega", email: "carlos.vega@example.com", ...bd(-8),
      tags: ["Past client"],
    }),
    cust({
      id: "c-maria", firstName: "Maria", lastName: "Rossi", email: "maria.rossi@example.com", ...bd(45),
      tags: ["Past client"], interests: ["wine"],
    }),
    cust({
      id: "c-james", firstName: "James", lastName: "O'Connor", email: "james.oc@example.com", ...bd(63),
      tags: ["Investor"], company: "Northgate Partners",
    }),
    cust({
      id: "c-zoe", firstName: "Zoe", lastName: "Adams", email: "zoe.adams@example.com", ...bd(110),
      tags: ["Past client"], interests: ["yoga"],
    }),
  ];
}

const biz = SEED_BUSINESS;
function base(partial: Partial<Send> & Pick<Send, "id" | "customerId" | "recipientName" | "recipientEmail" | "cardId" | "message" | "scheduledFor" | "status">): Send {
  return {
    source: "automation",
    automationId: "auto-main",
    messageFont: "classic",
    senderName: biz.senderName,
    fromLabel: biz.name,
    brandColor: biz.brandColor,
    logoDataUrl: null,
    gift: null,
    events: [],
    ...partial,
  };
}

export function seedSends(): Send[] {
  return [
    base({
      id: "s-rosa", customerId: "c-rosa", recipientName: "Rosa Delgado", recipientEmail: "rosa.delgado@example.com",
      cardId: "garden-arch", scheduledFor: at(3), status: "pending-review",
      message: "Happy birthday, Rosa! I hope this year brings your best tomato harvest yet and plenty of slow mornings in the garden. Warmly, Maya at Harbor & Pine",
      gift: { giftId: "coffee-card", amount: 15, shipping: 0, status: "pending-approval" },
      aiReasons: ["Interests include gardening", "Tagged VIP: gift rule applies"],
      events: [{ at: at(-1), label: "Prepared by birthday automation" }],
    }),
    base({
      id: "s-marcus", customerId: "c-marcus", recipientName: "Marcus Bell", recipientEmail: "marcus@bellandsons.example",
      cardId: "studio-trail", scheduledFor: at(5), status: "pending-review",
      message: "Happy birthday, Marcus! You helped us get Harbor & Pine off the ground, and we haven't forgotten it. Hope the year ahead has plenty of good trails. Maya",
      gift: { giftId: "coffee-card", amount: 15, shipping: 0, status: "pending-approval" },
      aiReasons: ["Interests include hiking", "Relationship note: helped us launch our business", "Tagged VIP: gift rule applies"],
      events: [{ at: at(-1), label: "Prepared by birthday automation" }],
    }),
    base({
      id: "s-priya", customerId: "c-priya", recipientName: "Priya Raman", recipientEmail: "priya.raman@example.com",
      cardId: "orbit-circles", scheduledFor: at(6), status: "pending-review",
      message: "Happy birthday, Priya! Wishing you a year full of good coffee and even better books. Warmly, Maya at Harbor & Pine",
      aiReasons: ["Interests include coffee and books"],
      events: [{ at: at(-1), label: "Prepared by birthday automation" }],
    }),
    base({
      id: "s-grace", customerId: "c-grace", recipientName: "Grace Kim", recipientEmail: "grace.kim@example.com",
      cardId: "citrus-toast", scheduledFor: at(9), status: "scheduled", approved: true,
      message: "Happy birthday, Grace! Here's to another year of full tables and good company. Warmly, Maya at Harbor & Pine",
      aiReasons: ["Interests include cooking"],
      events: [{ at: at(-2), label: "Prepared by birthday automation" }, { at: at(-1), label: "Approved by Maya Okafor" }],
    }),
    base({
      id: "s-tom", customerId: "c-tom", recipientName: "Tom Whitaker", recipientEmail: "tom.whitaker@example.com",
      cardId: "postmark", scheduledFor: at(12), status: "scheduled", approved: true,
      message: "Happy birthday, Tom! Thinking of you today and hoping the year ahead feels just like home. Warmly, Maya at Harbor & Pine",
      events: [{ at: at(-1), label: "Scheduled by birthday automation" }],
    }),
    base({
      id: "s-ben", customerId: "c-ben", recipientName: "Ben Asante", recipientEmail: "ben.asante@example.com",
      cardId: "party-hats", scheduledFor: at(14), status: "scheduled", approved: true,
      message: "Happy birthday, Ben! Hope you and Biscuit have a great day. Warmly, Maya at Harbor & Pine",
      events: [{ at: at(-1), label: "Scheduled by birthday automation" }],
    }),
    base({
      id: "s-diego", customerId: "c-diego", recipientName: "Diego Fuentes", recipientEmail: "diego@fuentesholdings.example",
      cardId: "postmark", scheduledFor: at(18), status: "scheduled", automationId: "auto-investors", approved: true,
      message: "Happy birthday, Diego. Wishing you a healthy and prosperous year ahead. Maya at Harbor & Pine",
      events: [{ at: at(-1), label: "Scheduled by Investors rule (card only)" }],
    }),
    base({
      id: "s-jamal", customerId: "c-jamal", recipientName: "Jamal Wright", recipientEmail: "jamal.wright@example.com",
      cardId: "sunburst", scheduledFor: at(22), status: "scheduled", approved: true,
      message: "Happy birthday, Jamal! Hope the year ahead has a great soundtrack. Warmly, Maya at Harbor & Pine",
      gift: { giftId: "coffee-card", amount: 15, shipping: 0, status: "held-budget", note: "This month's gift budget has been reached. The card stays scheduled; the gift waits for your review." },
      aiReasons: ["Interests include music", "Tagged VIP: gift rule applies"],
      events: [{ at: at(-1), label: "Card scheduled" }, { at: at(-1), label: "Gift held: monthly gift budget reached" }],
    }),
    // ---- Already sent this month ----
    base({
      id: "s-ava", customerId: "c-ava", recipientName: "Ava Thompson", recipientEmail: "ava.t@example.com",
      cardId: "wildflower-row", scheduledFor: at(-10), status: "opened", approved: true,
      message: "Happy birthday, Ava! Hope today comes with a good book and a long, quiet afternoon. Warmly, Maya at Harbor & Pine",
      events: [{ at: at(-10), label: "Sent" }, { at: at(-10, 11, 42), label: "Opened" }],
    }),
    base({
      id: "s-isaac", customerId: "c-isaac", recipientName: "Isaac Moreno", recipientEmail: "isaac.moreno@example.com",
      cardId: "big-type", scheduledFor: at(-6), status: "gift-claimed", approved: true,
      message: "Happy birthday, Isaac! The coffee's on us this year. Warmly, Maya at Harbor & Pine",
      gift: { giftId: "flex-card", amount: 25, shipping: 0, status: "claimed" },
      events: [{ at: at(-6), label: "Sent" }, { at: at(-6, 10, 5), label: "Opened" }, { at: at(-6, 10, 7), label: "Gift claimed" }],
    }),
    base({
      id: "s-fatima", customerId: "c-fatima", recipientName: "Fatima Hassan", recipientEmail: "fatima.h@example.com",
      cardId: "garden-arch", scheduledFor: at(-3), status: "awaiting-address", approved: true,
      message: "Happy birthday, Fatima! A few flowers are on their way to brighten the week. Warmly, Maya at Harbor & Pine",
      gift: { giftId: "flowers", amount: 48, shipping: 12.95, status: "awaiting-address" },
      events: [{ at: at(-3), label: "Sent" }, { at: at(-3, 9, 30), label: "Opened" }, { at: at(-3, 9, 31), label: "Waiting for delivery address" }],
    }),
    base({
      id: "s-henry", customerId: "c-henry", recipientName: "Henry Lewis", recipientEmail: "henry.lewis@exmaple.com",
      cardId: "candle-glow", scheduledFor: at(-1), status: "needs-attention", approved: true,
      message: "Happy birthday, Henry! Wishing you a wonderful year ahead. Warmly, Maya at Harbor & Pine",
      issue: "The email address looks mistyped (exmaple.com). Fix it and resend.",
      events: [{ at: at(-1), label: "Send attempted" }, { at: at(-1, 9, 1), label: "Delivery problem: address not reachable" }],
    }),
    base({
      id: "s-carlos", customerId: "c-carlos", recipientName: "Carlos Vega", recipientEmail: "carlos.vega@example.com",
      cardId: "citrus-toast", scheduledFor: at(-8), status: "sent", approved: true,
      message: "Happy birthday, Carlos! Thinking of you today and hoping the year ahead feels just like home. Warmly, Maya at Harbor & Pine",
      events: [{ at: at(-8), label: "Sent" }],
    }),
  ];
}

export function seedAutomations(): AutomationRule[] {
  return [
    {
      id: "auto-main",
      name: "Customer birthdays",
      active: true,
      segment: { type: "all" },
      cardId: "garden-arch",
      messageTemplate: SEED_BUSINESS.defaultMessage,
      sendTime: "09:00",
      timezone: "America/Chicago",
      giftMode: "gift",
      giftId: "coffee-card",
      giftAmount: 15,
      giftSegmentTag: "VIP",
      monthlyGiftBudget: 120,
      approval: "review",
      avoidRepeat: true,
      feb29: "feb28",
      lateAdd: "skip",
      aiPersonalize: true,
    },
    {
      id: "auto-investors",
      name: "Investors (card only)",
      active: true,
      segment: { type: "tag", tag: "Investor" },
      cardId: "postmark",
      messageTemplate:
        "Happy birthday, {{first_name}}. Wishing you a healthy and prosperous year ahead. {{sender_name}} at {{company_name}}",
      sendTime: "08:30",
      timezone: "America/Chicago",
      giftMode: "card-only",
      giftId: null,
      giftAmount: 0,
      giftSegmentTag: null,
      monthlyGiftBudget: 0,
      approval: "auto",
      avoidRepeat: true,
      feb29: "feb28",
      lateAdd: "skip",
      aiPersonalize: false,
    },
  ];
}

export function emptyDraft(cardId = "confetti-parade"): SendDraft {
  const d = new Date(Date.now() + 2 * DAY);
  return {
    cardId,
    recipientName: "",
    senderName: "",
    message: "",
    messageFont: "handwritten",
    gift: null,
    recipientEmail: "",
    when: "schedule",
    date: d.toISOString().slice(0, 10),
    time: "09:00",
    addressMode: "ask-recipient",
    address: { line1: "", city: "", region: "", postal: "" },
    extras: {},
  };
}

export function createSeedState(): DemoState {
  return {
    version: STATE_VERSION,
    onboarded: true,
    planId: "growth",
    business: SEED_BUSINESS,
    customers: seedCustomers(),
    sends: seedSends(),
    automations: seedAutomations(),
    savedCards: STUDIO_EXAMPLES.map((c) => ({ ...c })),
    orders: [],
    draft: null,
  };
}
