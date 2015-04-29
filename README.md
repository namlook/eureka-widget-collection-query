# Eureka-widget-collection-query

An UI to perform advanced queries on an Eureka collection. Usage:

// /config/eureka/resource/collection.js

    export default {
        queryParams: ['query'], // useful if you want to update the url as well
        widgets: [
            {
                type: 'collection-query',
                queryParam: 'query' // needed if you want to use queryParams
            }
        ]
    };


## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
