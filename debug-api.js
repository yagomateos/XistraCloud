// Test script to debug mock data
import { getLogs, getDomains, getProjects } from './src/lib/api.ts';

console.log('Testing API functions...');

// Test environment variables
console.log('API_URL:', import.meta.env.VITE_API_URL);
console.log('USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA);

// Test functions
getLogs().then(logs => {
  console.log('Logs:', logs);
}).catch(err => {
  console.error('Error getting logs:', err);
});

getDomains().then(domains => {
  console.log('Domains:', domains);
}).catch(err => {
  console.error('Error getting domains:', err);
});

getProjects().then(projects => {
  console.log('Projects:', projects);
}).catch(err => {
  console.error('Error getting projects:', err);
});
