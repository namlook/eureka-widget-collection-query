import Ember from 'ember';
import layout from '../templates/components/query-filter';
import {getFieldMeta} from 'ember-eureka/components/property-autosuggest';

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
        // {id: 'lt', label: 'before'},
        // {id: 'gt', label: 'after'},
        // {id: 'ne', label: 'not equal'},
        // {id: 'lte', label: 'before or equal'},
        // {id: 'gte', label: 'after or equal'},
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


    /*** relation related stuff ***/
    relationSuggestUrl: Ember.computed(
        'propertyMeta.type',
        'propertyMeta.relationModelMeta.store.resourceEndpoint',
        function() {
            return this.get('propertyMeta.relationModelMeta.store.resourceEndpoint');
    }),


    relationDefaultValue: Ember.computed('queryFilter.value', function() {
        var defaultValue = this.get('queryFilter.value');
        return Ember.A([
            {id: defaultValue, label: defaultValue}
        ]);
    }),


    relationSelect2QueryParametersFn: function(params) {
        var queryParameters = {};
        if (params.term) {
            queryParameters["title[$iregex]"] = '^'+params.term;
        }
        return queryParameters;
    },


    relationSelect2ProcessResultsFn: function(data) {
        var results = data.results.map(function(item) {
            return {id: item._id, text: item.title};
        });
        return {results: results};
    },


    /** if the queryFilter.property is changing, we have to
     * reset the operator and its value
     */
    _onPropertyChanged: Ember.observer('queryFilter.property', function() {
        this.set('queryFilter.operator', null);
        this.set('queryFilter.value', null);
    }),


    /** return the properties of the resources **/
    suggestedProperties: Ember.computed('queryFilter.modelMeta.fieldNames.[]', function() {
        var modelMeta = this.get('queryFilter.modelMeta');
        var propertyNames = modelMeta.get('fieldNames');
        var content = propertyNames.map(function(name) {
            return {
                id: name,
                label: modelMeta.get(name+'Field.label'),
            };
        });
        return content;
    }),

    /** return the selected property meta informations **/
    propertyMeta: Ember.computed('queryFilter.property', 'queryFilter.modelMeta', function() {
        var modelMeta = this.get('queryFilter.modelMeta');
        var property = this.get('queryFilter.property');
        return modelMeta.getFieldMeta(property);
    }),


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
