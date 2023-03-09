/**
 * Item.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {

    name:{
      type: 'string',
      required: true,
    },
    description:{
      type: 'string',
      required: true,
    },
    price:{
      type: 'number',
      required: true,
    },
    image:{
      type: 'string',
      required: true,
    },
    displayOrder:{
      type: 'number',
      
    },
    // one to many association between items and category
    category:{
      model: 'category'
    }

  },



};

