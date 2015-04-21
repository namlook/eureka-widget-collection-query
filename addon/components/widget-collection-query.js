
import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';
import QueryParametrableWidgetMixin from 'eureka-mixin-query-parametrable-widget';

import layout from '../templates/components/widget-collection-query';


export default WidgetCollection.extend(/*QueryParametrableWidgetMixin,*/ {
    layout: layout,

    /** Make the filterTerm a queryParam if configured in `config` */
    initQuery: function() {
        var filters = Ember.A();
        var routeModel = this.get('routeModel');

        var property, operator, value;
        routeModel.get('query').forEach(function(filter) {
            property = filter.field.split('[')[0];
            operator = filter.field.split('[')[1];
            if (operator) {
                operator = operator.split(']')[0].replace('$', '');
            } else {
                operator = 'equal';
            }
            value = filter.value;
            filters.pushObject({
                property: property,
                modelMeta: routeModel.get('meta'),
                operator: operator,
                value: value
            });
        });

        this.set('filters', filters);
    }.on('init'),


    /** update the `routeModel.query` */
    updateQuery: function() {
        var query = this.get('filters');

        var rawQuery = {};
        query.forEach(function(filter) {
            if (filter.operator === 'equal') {
                rawQuery[filter.property] = filter.value;
            } else {
                rawQuery[filter.property+'[$'+filter.operator+']'] = filter.value;
            }
        });

        this.set('routeModel.query.raw', rawQuery);
    },



    /** update the query when the user hit the enter key */
    keyPress: function(e) {
        if (e.keyCode === 13) {
            this.updateQuery();
        }
    },

    actions: {
        addFilter: function() {
            this.get('filters').pushObject({
                property: null,
                operator: null,
                modelMeta: this.get('routeModel.meta'),
                value: null
            });
        },
        removeFilter: function(filter) {
            this.get('filters').removeObject(filter);
        },
        updateCollection: function() {
            this.updateQuery();
        },
        clear: function() {
            this.set('filters', Ember.A());
            this.updateQuery();
        }
    }

});