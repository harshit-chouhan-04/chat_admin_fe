// Mock data for the admin panel
import { 
  Users, Bot, MessageSquare, MessagesSquare, DollarSign,
} from "lucide-react";

export const mockUsers = [
  { id: "usr_1", avatarUrl: "", name: "Sarah Chen", username: "sarahc", email: "sarah@example.com", credits: 2500, numberOfMessageLeft: 150, isEmailVerified: true, lastLoginAt: "2026-03-12T14:30:00Z", createdAt: "2025-11-01T10:00:00Z" },
  { id: "usr_2", avatarUrl: "", name: "Alex Morgan", username: "alexm", email: "alex@example.com", credits: 800, numberOfMessageLeft: 45, isEmailVerified: true, lastLoginAt: "2026-03-11T09:15:00Z", createdAt: "2025-12-15T08:00:00Z" },
  { id: "usr_3", avatarUrl: "", name: "James Wilson", username: "jamesw", email: "james@example.com", credits: 0, numberOfMessageLeft: 0, isEmailVerified: false, lastLoginAt: "2026-02-28T18:45:00Z", createdAt: "2026-01-20T12:00:00Z" },
  { id: "usr_4", avatarUrl: "", name: "Emily Davis", username: "emilyd", email: "emily@example.com", credits: 5000, numberOfMessageLeft: 300, isEmailVerified: true, lastLoginAt: "2026-03-13T06:00:00Z", createdAt: "2025-09-05T15:30:00Z" },
  { id: "usr_5", avatarUrl: "", name: "Michael Brown", username: "mikeb", email: "mike@example.com", credits: 1200, numberOfMessageLeft: 80, isEmailVerified: true, lastLoginAt: "2026-03-10T22:00:00Z", createdAt: "2026-02-01T09:00:00Z" },
  { id: "usr_6", avatarUrl: "", name: "Olivia Taylor", username: "oliviat", email: "olivia@example.com", credits: 350, numberOfMessageLeft: 20, isEmailVerified: false, lastLoginAt: "2026-03-05T11:30:00Z", createdAt: "2026-03-01T14:00:00Z" },
];

export const mockCategories = [
  { id: "cat_1", name: "Romance", slug: "romance", isNsfw: false, isActive: true, isDeleted: false },
  { id: "cat_2", name: "Adventure", slug: "adventure", isNsfw: false, isActive: true, isDeleted: false },
  { id: "cat_3", name: "Fantasy", slug: "fantasy", isNsfw: false, isActive: true, isDeleted: false },
  { id: "cat_4", name: "Sci-Fi", slug: "sci-fi", isNsfw: false, isActive: true, isDeleted: false },
  { id: "cat_5", name: "Horror", slug: "horror", isNsfw: false, isActive: true, isDeleted: false },
  { id: "cat_6", name: "Adult", slug: "adult", isNsfw: true, isActive: true, isDeleted: false },
  { id: "cat_7", name: "Comedy", slug: "comedy", isNsfw: false, isActive: false, isDeleted: false },
];

export const mockCharacters = [
  { id: "chr_1", avatarUrl: "", name: "Luna", slug: "luna", age: 22, gender: "Female", sexuality: "Bisexual", description: "A mysterious sorceress from an enchanted forest.", personalityPrompt: "You are Luna, a mysterious and wise sorceress...", systemPrompt: "Respond as Luna...", scenario: "You meet in a moonlit clearing.", greetingMessage: "Hello traveler, the stars told me you'd come...", conversationStyle: "Mystical", categories: ["cat_1", "cat_3"], voiceModel: "alloy", visibility: "public", isNsfw: false, rating: 4.8, ratingCount: 1250, isActive: true, creator: "usr_1" },
  { id: "chr_2", avatarUrl: "", name: "Atlas", slug: "atlas", age: 30, gender: "Male", sexuality: "Straight", description: "A fearless space captain exploring the galaxy.", personalityPrompt: "You are Atlas, a brave captain...", systemPrompt: "Respond as Atlas...", scenario: "Aboard a starship.", greetingMessage: "Welcome aboard, recruit!", conversationStyle: "Adventurous", categories: ["cat_2", "cat_4"], voiceModel: "echo", visibility: "public", isNsfw: false, rating: 4.5, ratingCount: 890, isActive: true, creator: "usr_2" },
  { id: "chr_3", avatarUrl: "", name: "Ivy", slug: "ivy", age: 25, gender: "Female", sexuality: "Lesbian", description: "A witty detective in a noir city.", personalityPrompt: "You are Ivy, a sharp detective...", systemPrompt: "Respond as Ivy...", scenario: "A rainy night in the city.", greetingMessage: "Another case? Let's hear it.", conversationStyle: "Noir", categories: ["cat_2"], voiceModel: "nova", visibility: "public", isNsfw: false, rating: 4.7, ratingCount: 650, isActive: true, creator: "usr_1" },
  { id: "chr_4", avatarUrl: "", name: "Shadow", slug: "shadow", age: 28, gender: "Non-binary", sexuality: "Pansexual", description: "A rogue hacker in a dystopian future.", personalityPrompt: "You are Shadow...", systemPrompt: "Respond as Shadow...", scenario: "A neon-lit underground club.", greetingMessage: "You found me. Impressive.", conversationStyle: "Cyberpunk", categories: ["cat_4", "cat_5"], voiceModel: "fable", visibility: "unlisted", isNsfw: false, rating: 4.3, ratingCount: 420, isActive: true, creator: "usr_4" },
];

export const mockConversations = [
  { id: "conv_1", title: "Moonlit Encounter", user: "usr_1", character: "chr_1", messageCount: 45, userMessageCount: 22, intimacyScore: 75, intimacyStage: "Close", totalTokenCount: 12500, totalCost: 0.25, personaName: "Aria", personaAge: 20, personaGender: "Female", createdAt: "2026-03-10T08:00:00Z", lastMessageAt: "2026-03-12T22:00:00Z", isArchived: false, memorySummary: "User has been visiting the forest for three days..." },
  { id: "conv_2", title: "Galactic Mission", user: "usr_2", character: "chr_2", messageCount: 120, userMessageCount: 58, intimacyScore: 40, intimacyStage: "Acquaintance", totalTokenCount: 35000, totalCost: 0.70, personaName: "Kai", personaAge: 25, personaGender: "Male", createdAt: "2026-03-01T12:00:00Z", lastMessageAt: "2026-03-13T05:00:00Z", isArchived: false, memorySummary: "Kai has proven himself a capable navigator..." },
  { id: "conv_3", title: "City Noir", user: "usr_3", character: "chr_3", messageCount: 30, userMessageCount: 14, intimacyScore: 20, intimacyStage: "Stranger", totalTokenCount: 8000, totalCost: 0.16, personaName: "Max", personaAge: 35, personaGender: "Male", createdAt: "2026-03-05T18:00:00Z", lastMessageAt: "2026-03-08T20:00:00Z", isArchived: true, memorySummary: "The detective case has gone cold..." },
  { id: "conv_4", title: "Neon Underground", user: "usr_4", character: "chr_4", messageCount: 80, userMessageCount: 39, intimacyScore: 55, intimacyStage: "Friend", totalTokenCount: 22000, totalCost: 0.44, personaName: "Zero", personaAge: 22, personaGender: "Non-binary", createdAt: "2026-03-08T14:00:00Z", lastMessageAt: "2026-03-12T16:00:00Z", isArchived: false, memorySummary: "Zero has been helping Shadow with a heist..." },
];

export const mockMessages = [
  { id: "msg_1", conversation: "conv_1", senderType: "user", content: "I've been dreaming about this forest again...", tokenCount: 45, cost: 0.001, isFlagged: false, createdAt: "2026-03-12T21:50:00Z" },
  { id: "msg_2", conversation: "conv_1", senderType: "ai", content: "The forest dreams of you too, traveler. The ancient trees whisper your name when the moon is high...", tokenCount: 120, cost: 0.003, isFlagged: false, createdAt: "2026-03-12T21:51:00Z" },
  { id: "msg_3", conversation: "conv_2", senderType: "user", content: "Captain, we're approaching the nebula.", tokenCount: 30, cost: 0.001, isFlagged: false, createdAt: "2026-03-13T04:55:00Z" },
  { id: "msg_4", conversation: "conv_2", senderType: "ai", content: "Hold steady, recruit. The Andromeda Nebula is beautiful but treacherous. Engage shields and prepare for turbulence.", tokenCount: 95, cost: 0.002, isFlagged: false, createdAt: "2026-03-13T04:56:00Z" },
  { id: "msg_5", conversation: "conv_3", senderType: "user", content: "This content has been flagged for review.", tokenCount: 50, cost: 0.001, isFlagged: true, createdAt: "2026-03-08T20:00:00Z" },
  { id: "msg_6", conversation: "conv_4", senderType: "ai", content: "The firewalls are down. We have exactly 90 seconds before they notice. Move.", tokenCount: 80, cost: 0.002, isFlagged: false, createdAt: "2026-03-12T16:00:00Z" },
];

export const mockPlans = [
  { id: "plan_1", name: "Free", price: 0, billingCycle: "monthly", credits: 100, messageLimit: 50, description: "Basic access with limited messages", isActive: true },
  { id: "plan_2", name: "Starter", price: 9.99, billingCycle: "monthly", credits: 1000, messageLimit: 500, description: "Great for casual users", isActive: true },
  { id: "plan_3", name: "Pro", price: 24.99, billingCycle: "monthly", credits: 5000, messageLimit: 2500, description: "Unlimited creativity", isActive: true },
  { id: "plan_4", name: "Enterprise", price: 99.99, billingCycle: "monthly", credits: 50000, messageLimit: 25000, description: "For power users and businesses", isActive: true },
  { id: "plan_5", name: "Annual Pro", price: 249.99, billingCycle: "yearly", credits: 60000, messageLimit: 30000, description: "Pro plan billed yearly — save 17%", isActive: true },
];

export const mockInvoices = [
  { id: "inv_1", invoiceId: "INV-2026-001", user: "usr_1", plan: "plan_3", amount: 24.99, currency: "USD", status: "paid", paymentProvider: "stripe", createdAt: "2026-03-01T00:00:00Z", paidAt: "2026-03-01T00:05:00Z" },
  { id: "inv_2", invoiceId: "INV-2026-002", user: "usr_2", plan: "plan_2", amount: 9.99, currency: "USD", status: "paid", paymentProvider: "stripe", createdAt: "2026-03-01T00:00:00Z", paidAt: "2026-03-01T00:03:00Z" },
  { id: "inv_3", invoiceId: "INV-2026-003", user: "usr_4", plan: "plan_4", amount: 99.99, currency: "USD", status: "paid", paymentProvider: "stripe", createdAt: "2026-03-01T00:00:00Z", paidAt: "2026-03-01T00:10:00Z" },
  { id: "inv_4", invoiceId: "INV-2026-004", user: "usr_5", plan: "plan_2", amount: 9.99, currency: "USD", status: "pending", paymentProvider: "stripe", createdAt: "2026-03-13T00:00:00Z", paidAt: null },
  { id: "inv_5", invoiceId: "INV-2026-005", user: "usr_6", plan: "plan_1", amount: 0, currency: "USD", status: "paid", paymentProvider: "none", createdAt: "2026-03-01T00:00:00Z", paidAt: "2026-03-01T00:00:00Z" },
];

export const dashboardStats = [
  { title: "Total Users", value: "12,486", change: "+12.5%", icon: Users },
  { title: "Total Characters", value: "3,842", change: "+8.2%", icon: Bot },
  { title: "Total Conversations", value: "48,291", change: "+23.1%", icon: MessagesSquare },
  { title: "Total Messages", value: "1.2M", change: "+18.7%", icon: MessageSquare },
  { title: "Revenue", value: "$84,320", change: "+15.3%", icon: DollarSign },
];

export const conversationsPerDay = [
  { date: "Mar 1", count: 1200 },
  { date: "Mar 2", count: 1350 },
  { date: "Mar 3", count: 1100 },
  { date: "Mar 4", count: 1480 },
  { date: "Mar 5", count: 1600 },
  { date: "Mar 6", count: 1550 },
  { date: "Mar 7", count: 1750 },
  { date: "Mar 8", count: 1900 },
  { date: "Mar 9", count: 1820 },
  { date: "Mar 10", count: 2100 },
  { date: "Mar 11", count: 2050 },
  { date: "Mar 12", count: 2300 },
  { date: "Mar 13", count: 2150 },
];

export const messageUsageOverTime = [
  { date: "Mar 1", user: 5200, ai: 8400 },
  { date: "Mar 2", user: 5800, ai: 9200 },
  { date: "Mar 3", user: 4900, ai: 7800 },
  { date: "Mar 4", user: 6100, ai: 9800 },
  { date: "Mar 5", user: 6800, ai: 10500 },
  { date: "Mar 6", user: 6500, ai: 10100 },
  { date: "Mar 7", user: 7200, ai: 11200 },
  { date: "Mar 8", user: 7800, ai: 12000 },
  { date: "Mar 9", user: 7500, ai: 11600 },
  { date: "Mar 10", user: 8500, ai: 13200 },
  { date: "Mar 11", user: 8200, ai: 12800 },
  { date: "Mar 12", user: 9100, ai: 14100 },
  { date: "Mar 13", user: 8800, ai: 13600 },
];

// Helper to resolve references
export function getUserById(id: string) {
  return mockUsers.find(u => u.id === id);
}

export function getCharacterById(id: string) {
  return mockCharacters.find(c => c.id === id);
}

export function getCategoryById(id: string) {
  return mockCategories.find(c => c.id === id);
}

export function getPlanById(id: string) {
  return mockPlans.find(p => p.id === id);
}
