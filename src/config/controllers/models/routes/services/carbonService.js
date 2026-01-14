const axios = require('axios');

const calculateCarbon = async (activityData) => {
  try {
    if (activityData.type === 'electricity') {
      // Fixed: 0.82 kg CO2 per kWh
      return activityData.value * 0.82;
    } else if (activityData.type === 'vehicle') {
      // Fixed: 0.21 kg CO2 per km
      return activityData.value * 0.21;
    } else if (activityData.type === 'gas') {
      // Fixed: 2.3 kg CO2 per kg LPG
      return activityData.value * 2.3;
    } else {
      throw new Error('Unsupported activity type');
    }
  } catch (error) {
    console.error('Carbon Error:', error.message);
    throw new Error('Carbon calc failed');
  }
};

module.exports = { calculateCarbon };