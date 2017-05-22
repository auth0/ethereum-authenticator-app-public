[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

Ethereum-mobile
============
Mobile app used as a Ethereum 2FA token.

### Quick Start

#### Before you start, tools you will need

* install npm
* bower and gulp (run the following commands):

```script
npm install -g bower
npm install -g gulp
```
* install Android SDK (no need android studio)

```script
https://developer.android.com/studio/index.html#downloads
```
Packages
```script
Android SDK tools (v.25.2.2 or greater)
Android SDK platform-tools (v.24.0.4 or greater)
Android SDK build-tools (v.24.0.3 or greater)
Android 6.0 (API 23)
	- sdk platform
	- intel x86 atom 64 system image
	- google Apis intel x86 atom_64 System Image
	- Google APIs
Extras
	- Android support repository (v.38)
	- Google play services (v.33)
	- Google repository (v.36)
	- Intel x86 Emulator Accelerator (HAXM installer) (v. 6.0.4)
	- Google usb driver (v.11)
```


* Add Platforms

```script
cordova platform add android
cordova platform add browser
```

* Create Mobile Emulator

	- open AVD MANAGER
	- click to create
	- fill the fields:
		- target (API 23)
		- CPU/ABI (Google APIs Intel Atom (x86_64))
		- Skin (Skin with dynamic hardware controls)
		- internal storage more than 1024mb or you can divide with in SDcard and 			  internal storage (recommended total 2048M)
		- Ram (1024M)


## Running auth0-login-mobile

#### Configure project:

```script
npm install
bower install
```

#### Add generated ethereum-crypto's **bundle.js** file into the project:

 - generate **bundle.js** - consult ethereum-crypto/README.md for more details.

 - place generated file into the following folder:
`/www/js/modules/common`


#### Run project

Run the application without emulation (ngCordova and push notifications do not work). 

`ionic serve`

- in diferent console execute

 `gulp watch`

Run the appliction with emulator (ngCordova works).

```script
ionic emulate android 
ionic emulate browser
```

If you want to live reload of js code or html code use this

```script
ionic emulate android --livereload
```

If you want to live reload of scss you need to open in another console :

`gulp watch`

#### Build Project

In root Folder there are a file named google-services.json add this into /platforms/android to emulate or build in android (!important)

```script
ionic build android
ionic build browser
```
the apk is in folder 

`/platforms/android/build/outputs/apk/android-debug.apk`
