
import Ember from 'ember';
import WidgetCollection from 'ember-eureka/widget-collection';
import QueryParametrableWidgetMixin from 'eureka-mixin-query-parametrable-widget';


export default WidgetCollection.extend(QueryParametrableWidgetMixin, {

    /** set the queryParam (used for the QueryParametrableWidgetMixin),
     * to the widget's `config.filter.queryParam`
     */
    'config.queryParam': Ember.computed.alias('config.filter.queryParam'),

    /** Make the filterTerm a queryParam if configured in `config` */
    query: function() {
        return Ember.Object.create();
    }.property(),

    /** update the `routeModel.query` from `filterTerm` */
    updateQuery: function() {
        var filterTerm = this.get('filterTerm');
        var query = this.getWithDefault('routeModel.query.raw');

        // TODO

        // if (filterTerm) {
        //     query['title[$iregex]'] = '^'+filterTerm;
        // } else {
        //     query['title[$iregex]'] = undefined;
        //     filterTerm = null;
        // }
        console.log('new query>>', query);
        this.set('routeModel.query.raw', query);
    },


    /** update the collection from the `routeModel.query` */
    collection: function() {
        var query = this.get('query');
        var routeQuery = this.get('routeModel.query.raw');
        Ember.setProperties(routeQuery, query);
        return this.get('store').find(routeQuery);
    }.property('routeModel.query.hasChanged', 'query', 'store'),


    /** update the query when the user hit the enter key */
    keyPress: function(e) {
        if (e.keyCode === 13) {
            this.updateQuery();
        }
    },


    actions: {
        clear: function() {
            this.set('filterTerm', null);
            this.updateQuery();
        }
    }

});