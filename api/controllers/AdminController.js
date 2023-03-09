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
                    err: 'User not exists'
                })
            }
            // if having error 
            if(err){
                return res.status(500).json({
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
                    return res.ok("login successful");

                } else {
                    //password is not a match
                    return res.status(500).json({
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
         return res.ok('logout successfully');
        
    },

    // create category
    create: async function(req, res){
        let category = req.body.category;
        console.log(category);
        
        // category field is empty or not entered 
        if(!category){
            return res.status(400).json({
                err: 'category not entered'
            })
        }

        // checking category already exist or not
        let item = await Category.find().where({category: category})
        console.log(item);
        
        if(item.length > 0){
            return res.status(400).json({
                err: 'Category already exists'
            })
            
        }
        // if category not exists then create category
        else{
            Category.create({
                category: category
            }).fetch().then(result =>{
                console.log('category create',result);
                return res.ok({ category, message: 'Category created successfully'})
            })
        }
    },

    // listing all the categories
    list: function(req, res){
        Category.find({}, function(err, result){
            if(err){
                return res.json({
                    err: err
                })
            }
            console.log(result);
            return res.ok(result)
        })
    },

    // updating a category
    update: async function(req, res){
        // getting category id through params
        let id = req.params.id;
        console.log(id);
        let category = req.body.category;
        console.log(category);
        let update = await Category.update({id: id})
        .set({
            category: category
        }).fetch()
        console.log(update);
        return res.ok({update, message:'updated'})
    },

    // deleting a category
    delete: async function(req, res){
        // getting category id through params
        let id = req.params.id;
        console.log(id);
        await Category.destroy({id:id})
        res.ok('deleted')
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
                err: 'All fields are required'
            })
        }
 
        // checking if displayOrder id already exists in particular category
        let item = await Item.find().where({category: categoryId, displayOrder: displayOrder})
        console.log(item);
        if(item.length > 0){
            return res.status(400).json({
                err: 'display Order already existing'
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

                return res.ok('item created successfully')
            })
        }
    },

    // listing a item category wise, search & pagination
    listItem: async function(req, res){
        // getting category id through params
        let categoryId = req.query.id;
        console.log('ghjhjhk',categoryId);

        const { name } = req.query;
        console.log('uyu',name);

        let page = req.query.page
        console.log(page);
        let limit = req.query.limit
        console.log(limit);

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
        
            return res.ok(categoryItems)
        }

        if(name){
             // getting all items
            const result = await Category.find({}).populate('items');

            // searching through filter
            result.map((category) => {
                return category.items = category.items.filter((item) => {  
                    return item.name.includes(name)
                })
            })

            console.log('jhjkhgjhkkhjh',result);
            return res.ok(result)
        }

        if(page && limit){
            let item = await Item.find({limit: limit, skip: page});
            return res.ok(item)
        }

        else{
            return res.json({
                message: 'Please enter any query'
            })
        }
        
    },

    // updating a item
    updateItem : async function(req, res){
        // getting item id through params
        let itemId = req.params.id;
        console.log(itemId);

        const {name, description, price, image, category} = req.body;
        
        console.log('item',req.body);

        var update = await Item.update({id: itemId})
        .set({
            name: name,
            description: description,
            price: price,
            image: image,
            category: category
        }).fetch()
        console.log('update item', update);
        return res.ok({update ,message:"Updated"})
    },

    // deleting a item
    deleteItem: async function(req, res){
        // getting a item id through params
        let id = req.params.id;
        console.log(id);
        var item = await Item.destroy({id:id})
        console.log( item);
        return res.ok('deleted')
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
        return res.ok(items)
    },


};

