/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "521da98133a441977702742ebbc5597f"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ca545f8144b22a4c1c1431a2398c8a3b"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d3f5ddbe4dd44c112eec6528515169e7"
  }, {
    "url": "index.html",
    "revision": "d28c60c7d40db094b2616fe9061aa4c8"
  }, {
    "url": "icon.svg",
    "revision": "90032217cc9061c880f5f0749efd40bf"
  }, {
    "url": "favicon.ico",
    "revision": "ddb1c80c78ca23cbc98410f8d30e4cff"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "787da7f9c0863507917f89e0d1125aac"
  }, {
    "url": "assets/index-C9uv61Eu.css",
    "revision": null
  }, {
    "url": "assets/index-BlDQnacF.js",
    "revision": null
  }, {
    "url": "assets/aistudio/image_c0a21763.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_b5ebd9f1.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_90cb0e23.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_74e884f0.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_5c864d72.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_413f5171.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_168a5982.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_064a0317.png",
    "revision": null
  }, {
    "url": "assets/aistudio/image_006b7805.png",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "787da7f9c0863507917f89e0d1125aac"
  }, {
    "url": "favicon.ico",
    "revision": "ddb1c80c78ca23cbc98410f8d30e4cff"
  }, {
    "url": "icon.svg",
    "revision": "90032217cc9061c880f5f0749efd40bf"
  }, {
    "url": "pwa-192x192.png",
    "revision": "d3f5ddbe4dd44c112eec6528515169e7"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ca545f8144b22a4c1c1431a2398c8a3b"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "521da98133a441977702742ebbc5597f"
  }, {
    "url": "manifest.webmanifest",
    "revision": "a5197651dfd390acb9a4f405b9db4319"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
