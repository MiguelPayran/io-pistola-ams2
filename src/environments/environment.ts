// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    hmr       : false,
    // API_URL: 'https://pistola.adoremeservices.com/app/api'
        API_URL: 'http://localhost:5000/api'
    //  API_URL: 'http://hj-prod-iis-1.ams.corp:9002/api'
     //API_URL: 'http://hj-test-iis-1.ams.corp:9002/api'
    //API_URL: 'https://prd.pistola.adoremeservices.com/app/api'
   // API_URL: 'http://pistola-poc:9073/api'
};


/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
