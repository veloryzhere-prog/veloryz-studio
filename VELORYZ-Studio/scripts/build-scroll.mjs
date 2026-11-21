/**
 * Produce a first-party, CSP-compatible Lenis v1.3.27 browser bundle.
 * Vendored MIT source lives in src/vendor/lenis; no external CDN or runtime download.
 */
import { build } from 'vite';
await build({
 configFile:false,
 publicDir:false,
 logLevel:'warn',
 build:{
  emptyOutDir:false,
  outDir:'public',
  lib:{
   entry:'src/vendor/lenis/browser.ts',
   formats:['iife'],
   name:'VELORYZ_Lenis',
   fileName:()=>'lenis-vendored.js'
  },
  minify:true,
  rollupOptions:{output:{codeSplitting:false}}
 }
});
console.log('Built self-hosted Lenis v1.3.27 smooth-scroll runtime.');
