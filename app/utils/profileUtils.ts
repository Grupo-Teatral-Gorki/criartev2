import { UserProfile } from './interfaces';

/**
 * Checks if a user's profile has all required fields completed
 * @param user - The user profile to check
 * @returns boolean - true if profile is complete, false otherwise
 */
export const isProfileComplete = (user: UserProfile | null): boolean => {
  if (!user) return false;
  
  // Required fields for profile completion
  const requiredFields = [
    user.firstName,
    user.lastName,
    user.email,
    user.cityId
  ];
  
  // Check if all required fields are present and not empty
  return requiredFields.every(field => field && field.trim().length > 0);
};

/**
 * Gets the missing required fields from a user profile
 * @param user - The user profile to check
 * @returns string[] - Array of missing field names
 */
export const getMissingProfileFields = (user: UserProfile | null): string[] => {
  if (!user) return ['firstName', 'lastName', 'email', 'cityId'];
  
  const missingFields: string[] = [];
  
  if (!user.firstName || user.firstName.trim().length === 0) {
    missingFields.push('firstName');
  }
  if (!user.lastName || user.lastName.trim().length === 0) {
    missingFields.push('lastName');
  }
  if (!user.email || user.email.trim().length === 0) {
    missingFields.push('email');
  }
  if (!user.cityId || user.cityId.trim().length === 0) {
    missingFields.push('cityId');
  }
  
  return missingFields;
};
