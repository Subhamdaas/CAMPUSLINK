/**
 * CAMPUSLINK - Master Store Link
 * 
 * Re-routes store logic to store.js.
 * All mock/demo operational data has been eliminated in favor of real API models and empty states.
 */

// If store.js already loaded, ensure window.CampusLinkStore is available
if (typeof CampusLinkStore === 'undefined' && typeof window.CampusLinkStore !== 'undefined') {
  var CampusLinkStore = window.CampusLinkStore;
}
