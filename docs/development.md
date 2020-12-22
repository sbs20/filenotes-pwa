# Development

## Useful scripts

```console
# Install dependencies
npm i .

# Compiles and hot-reloads for development
npm run serve

# Compiles and minifies for production
npm run build

# Lints and fixes files
npm run lint
```

## Generate PWA icons

See https://www.npmjs.com/package/vue-pwa-asset-generator

```console
npx vue-pwa-asset-generator -a ./public/img/filenotes-512.png -o ./var/icons/
```

### Reference

* Update available:
  https://medium.com/progressive-web-apps/pwa-create-a-new-update-available-notification-using-service-workers-18be9168d717
* Node crypto in browser:
  https://kucukkanat.com/posts/node-core-modules-on-browser.html#javascript-bundler-mysteries-can-we-do-that-on-browser
  and node-libs-browser
* Another vue app for reference: https://github.com/bloodysysy73/AdvancedTodoList/tree/master/src/components
* Installable PWAs: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Installable_PWAs
* Fonts:
  * System fonts: https://www.granneman.com/webdev/coding/css/fonts-and-formatting/default-fonts
  * Font shifting, FOIT and FOUT: https://web.dev/preload-optional-fonts/
  * Object url: https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications#Example_Using_object_URLs_to_display_images
  * Dropbox, using revisions: Dropbox sync: https://www.dropboxforum.com/t5/Discuss-Dropbox-Developer-API/Handling-of-local-and-remote-rev-differences/td-p/397757

## Things learnt
* Dropbox needs to have fetch handed to it
