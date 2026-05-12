// Generate unique ID format: GRV-2026-8F4K29
const generateApplicationId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GRV-${year}-${randomStr}`;
};
module.exports = { generateApplicationId };