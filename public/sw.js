if(!self.define){let e,s={};const n=(n,a)=>(n=new URL(n+".js",a).href,s[n]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=s,document.head.appendChild(e)}else e=n,importScripts(n),s()})).then((()=>{let e=s[n];if(!e)throw new Error(`Module ${n} didn’t register its module`);return e})));self.define=(a,c)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let i={};const r=e=>n(e,t),o={module:{uri:t},exports:i,require:r};s[t]=Promise.all(a.map((e=>o[e]||r(e)))).then((e=>(c(...e),i)))}}define(["./workbox-50de5c5d"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"bc895ef37870f545abc6f7faa981eac7"},{url:"/_next/static/AXcVuZsrNeZGOpkmoKtnq/_buildManifest.js",revision:"9262961651e0d7fa108aef74f09893fc"},{url:"/_next/static/AXcVuZsrNeZGOpkmoKtnq/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/123-6a0cf66fc95b3c25.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/187-9bc322a731e25a1e.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/358-d6c28a89e547544c.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/681-b345f113a4a8c897.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/814-3dcf571f182ddd96.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/87bc1fd9-025dfc8a28626bf3.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/920-bb61c4b7a30243ba.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/add-item-group/page-424f2d9c841234c5.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/history/page-c7ea21fdda1474f5.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/history/purchase/page-230c1e3c8a700506.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/history/purchase/share/%5Bid%5D/page-2b095b5c1bc3ed62.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/history/sale/page-4cc7fd1bcad4e719.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/history/stock/page-0dcdf8278c8a6e0c.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/layout-a79f1a72a875c069.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/page-b577076f662f015f.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/purchase/item/page-ba7d5300ef94577e.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/purchase/page-8531bdf1c374466e.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/purchase/party/page-73f1e7310e1fbdb7.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/sale/page-400e55d446ef18cb.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/settings/page-cdfcc8b549079a7e.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/stock/page-37b1dc438acb9c14.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/test/page-e0382cec62710fd0.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/app/test/purchase/page-54975d5ceb727856.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/ec45d31a-a805463423f245f4.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/framework-8883d1e9be70c3da.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/main-895c1feb22264ff1.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/main-app-946168fe7d3ae5ca.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/pages/_app-b555d5e1eab47959.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/pages/_error-d79168f986538ac0.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/chunks/polyfills-78c92fac7aa8fdd8.js",revision:"79330112775102f91e1010318bae2bd3"},{url:"/_next/static/chunks/webpack-2fa98c017ebcdbde.js",revision:"AXcVuZsrNeZGOpkmoKtnq"},{url:"/_next/static/css/6cd46c6d6ab69681.css",revision:"6cd46c6d6ab69681"},{url:"/_next/static/css/a81e3bcfea9cfd8c.css",revision:"a81e3bcfea9cfd8c"},{url:"/assets/icons/icon-128x128.png",revision:"07c12cd5382ddfec96b13696486ce959"},{url:"/assets/icons/icon-144x144.png",revision:"22e0bfd157787833dae111fd7e0e658e"},{url:"/assets/icons/icon-152x152.png",revision:"830227137482ec68b26459137b9ff555"},{url:"/assets/icons/icon-192x192.png",revision:"5f359ace97e76a2cef62e4d1ee496c39"},{url:"/assets/icons/icon-384x384.png",revision:"6b5f2fe20787298005c89798d3f97c1f"},{url:"/assets/icons/icon-48x48.png",revision:"9b64dca93fb0d603bb0a654d40e087d1"},{url:"/assets/icons/icon-512x512.png",revision:"720195d5a1a9efa638eb1805bd4fc8f8"},{url:"/assets/icons/icon-72x72.png",revision:"0cca480861f693a49fbc3a2c2d282ca0"},{url:"/assets/icons/icon-96x96.png",revision:"49fd1d25f5c1f0556dcc7898bb21b4a8"},{url:"/assets/icons/maskable.jpg",revision:"867fe8210f1dfbf25e26287f15198016"},{url:"/assets/images/add-button.png",revision:"bdf53adc8a3d6601f2d7fd14ca20e702"},{url:"/assets/images/close.png",revision:"072847b11d3019c1b534e218c6020dbe"},{url:"/assets/images/download (1).png",revision:"cf4a6a750ae9bf1a83772b6dec73cf9b"},{url:"/assets/images/folder-history.png",revision:"4359a2feffcf969f5f32d22b468a03bf"},{url:"/assets/images/jyesthalogo.jpg",revision:"867fe8210f1dfbf25e26287f15198016"},{url:"/assets/images/purchase.png",revision:"72b8ed4c8e4bc90eb726a2422f84f6ec"},{url:"/assets/images/refresh-arrow.png",revision:"c620cb09b5847f3f5b455e340c35feeb"},{url:"/assets/images/remove.png",revision:"733414404082df029a06b88e6a242fef"},{url:"/assets/images/sale.png",revision:"520daa6decfa98fae3f976ba4e28df69"},{url:"/assets/images/scan-qr-code.png",revision:"eea06938318dd0c2a846764e5a96fcff"},{url:"/assets/images/store.png",revision:"f1d53d557333b6eff503f1f437f3bf1a"},{url:"/assets/images/undo.png",revision:"a8faaa94808b78520e2e80775080e06f"},{url:"/assets/images/uploadfile.png",revision:"6002bf50ecf028210f554fd5cf174660"},{url:"/manifest.json",revision:"b3b04e92e712413dfb23251ded5a5c61"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:n,state:a})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
