import db from "../../db.json" with { type: "json" };

/**
 * @typedef {Object} Badge
 * @property {number} id - Unique badge identifier
 * @property {string} description - Badge description
 * @property {Date} date - Badge conquest date
 */

/**
 * @typedef {Object} Goal
 * @property {string} description - Badge description
 * @property {number} xp - Goal experience
 * @property {number} currentXp - Current goal experience
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} name - Display name
 * @property {number} balance - Wallet balance
 * @property {number} level - Current level
 * @property {number} xp - Level experience
 * @property {Array<number>} badgeIds - IDs of earned badges
 * @property {Array<Goal>} goals - User goals
 */

/**
 * @typedef {Object} Market
 * @property {number} id - Coin ID
 * @property {string} name - Coin name
 * @property {number} price - Coin price
 * @property {number} change - Coin change
 * @property {number} cap - Market cap
 */

/**
 * @typedef {Object} PegasisDB
 * @property {Array<User>} users
 * @property {Array<Market>} market
 * @property {Array<Badge>} badges
 */

export function getUsers() {
    return db.users;
}

export function getUserById(id) {
    return db.users.filter((u) => u.id === id)[0];
}

export function getBadges() {
    return db.badges;
}

export function getBadgeById(id) {
    return db.badges.filter((b) => b.id === id)[0];
}

export function getMarketData() {
    return db.market;
}

export function getMarketById(id) {
    return db.market.filter((m) => m.id === id)[0];
}

console.log("badge 1: ", getBadgeById(1).description);
console.log("badge 2: ", getBadgeById(2));
console.log("badge 3: ", getBadgeById(3));
