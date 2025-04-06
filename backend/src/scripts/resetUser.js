const { User } = require('../models');

async function resetTestUser() {
  try {
    // Delete the test user if it exists
    await User.destroy({
      where: {
        email: 'test@example.com'
      }
    });

    console.log('Test user deleted successfully');
  } catch (error) {
    console.error('Error resetting test user:', error);
  } finally {
    process.exit();
  }
}

resetTestUser(); 