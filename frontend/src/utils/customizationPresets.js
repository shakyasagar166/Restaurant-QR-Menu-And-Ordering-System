/**
 * Dish Customization Presets & Sugar / Spice Helper
 * Handles diner preferences (e.g. "Chai me kitni chammach cheeni", "Kam teekha", "Extra butter", "Jain")
 */

export function getItemCustomizationType(itemName = '', categoryName = '') {
  const name = (itemName || '').toLowerCase();
  const cat = (categoryName || '').toLowerCase();

  // Beverages / Tea / Coffee / Drinks / Shakes
  if (
    name.includes('chai') ||
    name.includes('tea') ||
    name.includes('coffee') ||
    name.includes('shake') ||
    name.includes('milk') ||
    name.includes('lassi') ||
    name.includes('mojito') ||
    name.includes('soda') ||
    name.includes('cooler') ||
    name.includes('sharbat') ||
    name.includes('badam') ||
    cat.includes('beverage') ||
    cat.includes('mocktail')
  ) {
    return 'BEVERAGE';
  }

  // Breads / Roti / Naan / Paratha / Kulcha
  if (
    name.includes('roti') ||
    name.includes('naan') ||
    name.includes('paratha') ||
    name.includes('parantha') ||
    name.includes('kulcha') ||
    cat.includes('bread')
  ) {
    return 'BREAD';
  }

  // Rice / Pulao / Biryani
  if (name.includes('rice') || name.includes('pulao') || name.includes('biryani')) {
    return 'RICE';
  }

  // Default: Curries, Dal, Chinese, Chaat, Starters, Thali
  return 'FOOD';
}

export const CUSTOMIZATION_PRESETS = {
  BEVERAGE: {
    type: 'BEVERAGE',
    icon: '☕',
    title: 'Kitni Chammach Cheeni? (Sugar Preference)',
    subtitle: 'चाय/कॉफी में चीनी व दूध की पसंद चुनें',
    placeholder: 'उदा. 2 चम्मच चीनी, अदरक ज्यादा, गर्म...',
    chips: [
      { label: '0 Sugar (बिना चीनी)', value: '0 Cheeni (Sugar-Free)' },
      { label: '1 Spoon (1 चम्मच चीनी)', value: '1 Chammach Cheeni' },
      { label: '2 Spoons (2 चम्मच चीनी)', value: '2 Chammach Cheeni' },
      { label: '3 Spoons (3 चम्मच चीनी)', value: '3 Chammach Cheeni' },
      { label: 'कम मीठा (Less Sweet)', value: 'Kam Meetha' },
      { label: 'कड़क अदरक (Kadak Ginger)', value: 'Kadak & Adrak' },
      { label: 'कम दूध / Light Milk', value: 'Kam Doodh (Light Milk)' },
    ],
  },
  FOOD: {
    type: 'FOOD',
    icon: '🌶️',
    title: 'Spice & Preparation (तीखापन व निर्देश)',
    subtitle: 'मिर्च, मक्खन, प्याज/लहसुन की प्राथमिकता चुनें',
    placeholder: 'उदा. कम तीखा, एक्स्ट्रा मक्खन, बिना प्याज...',
    chips: [
      { label: '🌶️ कम तीखा (Mild)', value: 'Kam Teekha (Mild)' },
      { label: '🌶️🌶️ Medium Spicy', value: 'Medium Spicy' },
      { label: '🔥 Extra Spicy (तीखा)', value: 'Extra Teekha' },
      { label: '🌿 जैन (Bina Pyaz/Lehsun)', value: 'Jain (No Onion/Garlic)' },
      { label: '🧈 Extra Makhan / Ghee', value: 'Extra Makhan / Desi Ghee' },
      { label: '🍋 Extra Nimbu & Pyaz', value: 'Extra Lemon & Onions' },
      { label: '♨️ Less Oil / कम तेल', value: 'Kam Tel (Less Oil)' },
    ],
  },
  BREAD: {
    type: 'BREAD',
    icon: '🫓',
    title: 'Roti / Naan Preference (मक्खन व तैयारी)',
    subtitle: 'मक्खन, कड़कपन व गरमा-गरम निर्देश',
    placeholder: 'उदा. करारी सेंकना, मक्खन ज्यादा...',
    chips: [
      { label: '🧈 Extra Butter', value: 'Extra Butter' },
      { label: '🚫 सूखी रोटी (Bina Butter)', value: 'Bina Butter (Sukhi Roti)' },
      { label: '🔥 करारी / Crispy', value: 'Karari / Crispy sekna' },
      { label: '♨️ एकदम गरम', value: 'Ekdam Garam Garam' },
    ],
  },
  RICE: {
    type: 'RICE',
    icon: '🍚',
    title: 'Rice & Biryani Preference (चावल व निर्देश)',
    subtitle: 'तीखापन व रायता प्राथमिकता',
    placeholder: 'उदा. कम तीखा, प्याज अलग से...',
    chips: [
      { label: '🌶️ कम तीखा (Mild)', value: 'Kam Teekha (Mild)' },
      { label: '🌶️🌶️ Medium Spicy', value: 'Medium Spicy' },
      { label: '🌿 जैन (Bina Pyaz/Lehsun)', value: 'Jain (No Onion/Garlic)' },
      { label: '🧅 Extra Pyaz / Salad', value: 'Extra Onions & Salad' },
    ],
  },
};
