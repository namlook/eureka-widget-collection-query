import Ember from 'ember';
import layout from '../templates/components/query-filter';


var operatorChoices = {
    text: [
        {id: 'equal', label: 'equal'},
        {id: 'ne', label: 'not equal'},
        {id: 'regex', label: 'regex'},
        {id: 'iregex', label: 'iregex'},
        {id: 'exists', label: 'exists'},
    ],
    number: [
        {id: 'equal', label: 'equal'},
        {id: 'ne', label: 'not equal'},
        {id: 'gt', label: 'greater than'},
        {id: 'gte', label: 'greater or equal than'},
        {id: 'lt', label: 'lower than'},
        {id: 'lte', label: 'lower or equal than'},
        {id: 'exists', label: 'exists'},
    ],
    date: [
        {id: 'equal', label: 'equal'},
        {id: 'ne', label: 'not equal'},
        {id: 'lt', label: 'before'},
        {id: 'lte', label: 'before or equal'},
        {id: 'gt', label: 'after'},
        {id: 'gte', label: 'after or equal'},
        {id: 'exists', label: 'exists'},
    ],
    boolean: [
        {id: 'equal', label: 'equal'},
        {id: 'exists', label: 'exists'},
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
    isBoolean: Ember.computed.alias('propertyMeta.isBoolean'),
    isDate: Ember.computed.alias('propertyMeta.isDate'),
    isDateTime: Ember.computed.alias('propertyMeta.isDateTime'),
    isRelation: Ember.computed.alias('propertyMeta.isRelation'),

    /*** relation related stuff ***/
    relationSuggestUrl: function() {
        return this.get('propertyMeta.relationModelMeta.store.resourceEndpoint');
    }.property('propertyMeta.type', 'propertyMeta.relationModelMeta.store.resourceEndpoint'),

    relationDefaultValue: function() {
        var defaultValue = this.get('queryFilter.value');
        return Ember.A([
            {id: defaultValue, label: defaultValue}
        ]);
    }.property('queryFilter.value'),


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
    _onPropertyChanged: function() {
        this.set('queryFilter.operator', null);
        this.set('queryFilter.value', null);
    }.observes('queryFilter.property'),


    /** return the properties of the resources **/
    suggestedProperties: function() {
        var modelMeta = this.get('queryFilter.modelMeta');
        var propertyNames = modelMeta.get('fieldNames');
        var content = propertyNames.map(function(name) {
            return {
                id: name,
                label: modelMeta.get(name+'Field.label'),
            };
        });
        return content;
    }.property('queryFilter.modelMeta.fieldNames'),

    /** return the selected property meta informations **/
    propertyMeta: function() {
        var property = this.get('queryFilter.property');
        return this.get('queryFilter.modelMeta.'+property+'Field');
    }.property('queryFilter.property'),


    /** return a suggestion of operator for the selected property **/
    suggestedOperators: function() {
        var propertyMeta = this.get('propertyMeta');
        var operators = Ember.A([]);

        if (propertyMeta) {
            operators.pushObject({id: null, label: `--- ${propertyMeta.get('type')} ---`});
            if (this.get('isText')) {
                operators.pushObjects(operatorChoices.text);
            } else if (this.get('isNumber')) {
                operators.pushObjects(operatorChoices.number);
            } else if (this.get('isBoolean')) {
                operators.pushObjects(operatorChoices.boolean);
                this.set('queryFilter.operator', 'equal');
            } else if (this.get('isDate')) {
                operators.pushObjects(operatorChoices.date);
            } else if (this.get('isDateTime')) {
                operators.pushObjects(operatorChoices.date);
            } else if (this.get('isRelation')) {
                operators.pushObjects(operatorChoices.relation);
                this.set('queryFilter.operator', 'equal');
            }
        }


        /** if the filter's operator is not in the suggested operators,
         * it means that the property may have changed.
         */
        if (!operators.findBy('id', this.get('queryFilter.operator'))) {
            this.set('queryFilter.operator', null);
        }

        return operators;
    }.property('query.property', 'propertyMeta'),


    /** used to display the correct values when a property has a boolean type **/
    suggestedBooleans: function() {
        return [
            {id: 'true', label: 'true'},
            {id: 'false', label: 'false'}
        ];
    }.property()
});
