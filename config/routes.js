/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  // home page
  'GET /': { view: 'pages/homepage' },


  // login
  'POST /login': 'AdminController.login',

  // logout
  'GET /logout': 'AdminController.logout',

  // category create
  'POST /create': 'AdminController.create',

  // listing  category
  'GET /list': 'AdminController.list',

  // updating category
  'PUT /update/:id': 'AdminController.update',

  // deleting category
  'POST /delete/:id': 'AdminController.delete',


  // creating a item
  'POST /createItem/:id': 'AdminController.createItem',

  // listing a item category wise, search & pagination
  'GET /listItem': 'AdminController.listItem',

  // updating a item
  'PUT /updateItem/:id': 'AdminController.updateItem',

  // deleting a item
  'POST /deleteItem/:id': 'AdminController.deleteItem',

  // showing all items
  'GET /showAllItems': 'AdminController.showAllItems',



  // showing all items to users
  'GET /showAllItemsToUsers' : 'UserController.showAllItemsToUsers',



};
