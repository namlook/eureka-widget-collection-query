import Ember from 'ember';
import layout from '../templates/components/query-filter';
// import {getFieldMeta} from 'ember-eureka/components/property-autosuggest';

var operatorChoices = {
    text: [
        {id: 'iregex', label: 'contains'},
        {id: 'equal', label: 'equal'},
        {id: 'ne', label: 'not equal'},
        {id: 'exists', label: 'filled'},
    ],
    number: [
        {id: 'equal', label: 'equal'},
        {id: 'gt', label: 'greater than'},
        {id: 'lt', label: 'lower than'},
        {id: 'ne', label: 'not equal'},
        {id: 'gte', label: 'greater or equal'},
        {id: 'lte', label: 'lower or equal'},
        {id: 'exists', label: 'filled'},
    ],
    date: [
        {id: 'equal', label: 'equal'},
        {id: 'lt', label: 'before'},
        {id: 'gt', label: 'after'},
        {id: 'ne', label: 'not equal'},
        {id: 'lte', label: 'before or equal'},
        {id: 'gte', label: 'after or equal'},
        {id: 'exists', label: 'filled'},
    ],
    boolean: [
        {id: 'equal', label: 'equal'},
        {id: 'exists', label: 'filled'},
    ],
    relation: [
        {id: 'equal', label: 'equal'}
    ]
};


export default Ember.Component.extend({
    tagName: 'span',
    layout: layout,
    queryFilter: null,
    isRelationSuggestionsLoading: false,
    store: Ember.computed.alias('propertyMeta.relationModelMeta.store'),


    isText: Ember.computed.alias('propertyMeta.isText'),
    isNumber: Ember.computed.alias('propertyMeta.isNumber'),
    isBoolean: Ember.computed('propertyMeta.isBoolean', 'queryFilter.operator', function() {
        if (this.get('queryFilter.operator') === 'exists') {
            return true;
        }
        return this.get('propertyMeta.isBoolean');
    }),
    isDate: Ember.computed.alias('propertyMeta.isDate'),
    isDateTime: Ember.computed.alias('propertyMeta.isDateTime'),
    isRelation: Ember.computed.alias('propertyMeta.isRelation'),


    /** if the queryFilter.property is changing, we have to
     * reset the operator and its value
     */
    _onPropertyChanged: Ember.observer('queryFilter.property', function() {
        this.set('queryFilter.operator', null);
        this.set('queryFilter.value', null);
    }),

    /** return the selected property meta informations **/
    propertyMeta: Ember.computed('queryFilter.property', 'queryFilter.modelMeta', function() {
        var modelMeta = this.get('queryFilter.modelMeta');
        var property = this.get('queryFilter.property');
        return modelMeta.getFieldMeta(property);
    }),


    _loadSuggestedRelation() {
        let store = this.get('store');
        let searchTerm = this.get('relationSearchTerm');
        let oldSearchTerm = this.get('oldSearchTerm');
        if (store && (searchTerm && searchTerm !== oldSearchTerm || !searchTerm)) {
            this.set('isRelationSuggestionsLoading', true);
            this.set('oldSearchTerm', searchTerm);
            let query = {};
            if (searchTerm) {
                query = {filter: {title: {$iregex: searchTerm}}};
            }
            store.find(query).then((data) => {
                let results = data.map((item) => {
                    return {id: item.get('_id'), label: item.get('title')};
                });
                this.set('isRelationSuggestionsLoading', false);
                this.set('suggestedRelations', results);
            });
        }
    },


    onInit: Ember.on('init', Ember.observer('store', function() {
        let store = this.get('store');
        let relId = this.get('queryFilter.value');
        if (relId && store) {
            store.fetch(relId).then((relation) => {
                let results = [{
                    id: relation.get('_id'),
                    label: relation.get('title')
                }];
                this.set('suggestedRelations', results);
            });
        }

    })),

    loadSuggestedRelation: Ember.observer('relationSearchTerm', 'store', function() {
        Ember.run.debounce(this, function() {
            this._loadSuggestedRelation();
        }, 0);
    }),


    actions: {
        relationSearchFilter(relationSearchTerm) {
            this.set('relationSearchTerm', relationSearchTerm);
        }
    },


    /** return a suggestion of operator for the selected property **/
    suggestedOperators: Ember.computed('queryFilter.operator', 'propertyMeta.typeCategory', function() {
        var typeCategory = this.get('propertyMeta.typeCategory');
        var operators = Ember.A([]);

        if (typeCategory) {
            operators.pushObjects(operatorChoices[typeCategory]);
        }


        /** if the filter's operator is not in the suggested operators,
         * it means that the property may have changed. Then, we fill
         * the operator with the first suggestion
         */
        if (!operators.findBy('id', this.get('queryFilter.operator'))) {
            var operator = null;
            if (typeCategory) {
                operator = operatorChoices[typeCategory][0].id;
            }
            this.set('queryFilter.operator', operator);
        }

        return operators;
    }),


    /** used to display the correct values when a property has a boolean type **/
    suggestedBooleans: Ember.computed(function() {
        return [
            {id: 'true', label: 'true'},
            {id: 'false', label: 'false'}
        ];
    })
});
