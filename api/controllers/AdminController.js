/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


module.exports = {
  

    // admin login 
    login: function(req, res){
        const { email, password } = req.body;

        console.log('login', req.body);

        // finding the admin through email
        Admin.find({email}, function(err, admin){
            console.log(admin);

            // if admin not exists
            if(admin.length == 0){
                return res.status(403).json({
                    status: 403,
                    err: 'User not exists'
                })
            }
            // if having error 
            if(err){
                return res.status(500).json({
                    status: 500,
                    err: err
                })
            }
            // compare the encrypted password and entered password
            bcrypt.compare(password, admin[0].password, async function(err, result) {
                console.log(req.body.password);
                console.log(admin[0].password);
                // if result is true then admin will successfully login
                if(result) {
                    console.log(result);
                    const token = jwt.sign({
                        adminId: admin[0].id
                    },
                    'secret'
                    );
                    res.cookie("access_token", token, { // cookie for login and logout
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    })
                    return res.status(200).json({
                        status: 200,
                        message: 'login successful'
                    })

                } else {
                    //password is not a match
                    return res.status(500).json({
                        status: 500,
                        err: 'password not match'
                    })
                    
                }
            });
        })
    },

    // admin logout
    logout: function(req, res){
        // clear cookie for logout
         res.clearCookie('access_token');
         return res.status(200).json({
            status: 200,
            message: 'logout successfully'
        })
        
    },

    // create category
    create: async function(req, res){
        let category = req.body.category;
        console.log(category);
        
        // category field is empty or not entered 
        if(!category){
            return res.status(400).json({
                status: 400,
                err: 'category not entered'
            })
        }

        // checking category already exist or not
        let item = await Category.find().where({category: category})
        console.log(item);
        
        if(item.length > 0){
            return res.status(400).json({
                status: 400,
                err: 'Category already exists'
            })
            
        }
        // if category not exists then create category
        else{
            Category.create({
                category: category
            }).fetch().then(result =>{
                console.log('category create',result);
                return res.status(200).json({
                    status: 200,
                    data: result,
                    message: 'Category created successfully'
                })
                
            })
        }
    },

    // listing all the categories
    list: function(req, res){
        Category.find({}, function(err, result){
            if(err){
                return res.status(400).json({
                    status: 400,
                    err: err
                })
            }
            console.log(result);
            return res.status(200).json({
                status:200,
                data: result,
                message: 'All the Categories'
            })
           
        })
    },

    // updating a category
    update: async function(req, res){
        // getting category id through params
        let id = req.params.id;
        console.log(id);
        let category = req.body.category;
        console.log(category);
        let update = await Category.updateOne({id: id})
        .set({
            category: category
        }).fetch()
        console.log(update);
        return res.status(200).json({
            status: 200,
            data : update,
            message: 'Updated Sucessfully'
        })
      
    },

    // deleting a category
    delete: async function(req, res){
        // getting category id through params
        let id = req.params.id;
        console.log(id);
        let category = await Category.find({id: id})
        await Category.destroy({id:id})
        console.log(category);
        return res.status(200).json({
            status: 200,
            data: category,
            message: "Deleted Sucessfully"
        })
  
    },

    // creating a item to particular category
    createItem: async function(req, res){
        let categoryId = req.params.id;
        console.log(categoryId);
        const {name, description, price, image, displayOrder} = req.body;
        console.log(displayOrder);
        console.log('item',req.body);
        
        // if name field is empty
        if(!name || !description || !price || !image || !displayOrder){
            return res.status(400).json({
                status: 400,
                err: 'All fields are required'
            })
        }
 
        // checking if displayOrder id already exists in particular category
        let item = await Item.find().where({category: categoryId, displayOrder: displayOrder})
        console.log(item);
        if(item.length > 0){
            return res.status(400).json({
                status:400,
                err: 'display Order already existing'
            })
            
        }

        let items = await Item.find({name: name})
        if(items.length >0){
            return res.status(400).json({
                status:400,
                err: 'Item already existing'
            })
        }
        // otherwise create a item
        else{
            Item.create({
                name: name,
                description: description,
                price: price,
                image: image,
                category: categoryId,
                displayOrder: displayOrder
            }).fetch().then(async result =>{
                console.log('item create',result);
                return res.status(200).json({
                    status: 200,
                    data: result,
                    message: 'item created successfully'
                })
            })
        }
    },

    // listing a item category wise, search & pagination
    listItem: async function(req, res){
        // getting category id through params
        let categoryId = req.query.id;
        console.log('ghjhjhk',categoryId);

        // getting item name or search keyword
        const { name } = req.query;
        console.log('uyu',name);

        // getting skip & limit for pagination
        let skip = req.query.skip
        console.log(skip);
        let limit = req.query.limit
        console.log(limit);

        // show items according to category
        if(categoryId){
            console.log(categoryId);
            // getting all the items 
            let categoryItems = await Category.findOne({id:categoryId}).populate('items');
            console.log(categoryItems);

            // sorting according to displayOrder
            categoryItems.items.sort((item1, item2) => item1.displayOrder - item2.displayOrder)

            // calculate totalItems
            let totalItems = await Item.count({category: categoryId});
            console.log(totalItems);
            categoryItems.totalItems = totalItems;
            
            return res.status(200).json({
                status: 200,
                data: categoryItems,
                message: "Listing items according to category"
            })
         
        }

        // searching items
        if(name){

            const result = await Item.find({name : {
                'contains' : name
            }});

            console.log(result);
            return res.status(200).json({
                status:200,
                data: result,
                message: "Searched Items"
            })
       
        }

        // Pagination
        if(skip && limit){
           
            let item = await Item.find({}).limit(limit).skip(skip*limit);

            return res.status(200).json({
                status: 200,
                data: item,
                
            })
        
        }

        // otherwise enter any query
        else{
            return res.status(400).json({
                status:400,
                message: 'Please enter any query'
            })
        }
        
    },

    // updating a item
    updateItem : async function(req, res){
        // getting item id through params
        let itemId = req.params.id;
        console.log(itemId);

        const {name, description, price, image, category, displayOrder} = req.body;
        
        console.log('item',req.body);

        let categoryItem = await Item.findOne({id: itemId})
        console.log(categoryItem);

        let categoryId = categoryItem.category;
        console.log(categoryId);

        // checking if displayOrder id already exists in particular category
        let item = await Item.find().where({category: categoryId, displayOrder: displayOrder})
        console.log(item);
        if(item.length > 0){
            return res.status(400).json({
                status:400,
                err: 'display Order already existing'
            })
            
        }

        var update = await Item.update({id: itemId})
        .set({
            name: name,
            description: description,
            price: price,
            image: image,
            category: category,
            displayOrder: displayOrder
        }).fetch()
        console.log('update item', update);
        return res.status(200).json({
            status: 200,
            data: update,
            message: "Item Updated Successfully"
        })
        
    },

    // deleting a item
    deleteItem: async function(req, res){
        // getting a item id through params
        let id = req.params.id;
        console.log(id);
        let item = await Item.find({id:id})
        await Item.destroy({id:id})
        console.log( item);
        return res.status(200).json({
            status: 200,
            data: item,
            message: "Item deleted Successfully"
        })
     
    },

    // showing all items
    showAllItems : async function(req, res){
        let items = await Category.find({}).populate('items');
        console.log(items);
       
        // sorting according to display order and show totalItems
        items.map((item) => {
            item.items.sort((item1, item2) => item1.displayOrder - item2.displayOrder)
            item.totalItems = item.items.length;
        })
        return res.status(200).json({
            status: 200,
            data: items,
            message: "All the Items"
        })
    },


};

