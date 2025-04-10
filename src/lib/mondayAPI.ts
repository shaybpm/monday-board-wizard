
// Re-export all API functions for backwards compatibility
import { validateCredentials } from './api/authApi';
import { fetchBoardStructure } from './api/boardApi';
import { fetchDebugItems, fetchDebugSubitems } from './api/debugApi';

export {
  validateCredentials,
  fetchBoardStructure,
  fetchDebugItems,
  fetchDebugSubitems
};
