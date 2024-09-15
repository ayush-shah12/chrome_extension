// e2e/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',          
  timeout: 30000,       
  expect: {
    timeout: 5000,        },
  reporter: 'list',     
  use: {
    headless: false,    
    video: 'on-first-retry', 
    trace: 'on-first-retry', 
  },
});
