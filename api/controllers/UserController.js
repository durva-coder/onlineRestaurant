/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {
  
    // showing all the items
    showAllItemsToUsers : async function(req, res){
        let items = await Category.find({}).populate('items');
        console.log('jhjj',items);
        console.log('fdhfghjfgkghkjhklkghjkhgj------------------------------------------------------------------------------');
       
        // sorting items according to display order & show total items
        items.map((item) => {
            item.items.sort((item1, item2) => item1.displayOrder - item2.displayOrder)
            item.totalItems = item.items.length;
        })
        res.ok(items)
    },

};

