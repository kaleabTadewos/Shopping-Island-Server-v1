const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { Address } = require('../models/address');
const { OrderDetail } = require('../models/orderDetail');
const { Item } = require('../models/item');
const ApiResponse = require('../models/apiResponse');
const ErrorResponse = require('../models/errorResponse');
const { validateId, validateWithOutId, validateWithId, validateShoppingCart,
    validateOrderPlacement, validateSingleOrderPlacement, validateRemoveShoppingCart 
    , validateBuyNow , validateUpdateOrderStatus
} = require('../models/request/user.request');
const config = require('config');


exports.insert = async(req, res, next) => {
    const { error } = validateWithOutId(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    let userExist = await User.findOne({ email: req.body.email });
    if (userExist) return res.status(400).send('user already exist');

    const newAddress = await Address.findById(req.body.addressId);
    console.log(newAddress);
    if (!newAddress) return res.status(400).send('invalid address id!');
    let address = [newAddress];
    const userStatus = (req.body.role == "SELLER") ? "PENDING" : "ACTIVE";
    const user = await User.create({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        status: userStatus,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        addresses: address,
        'billingInformation.state': req.body.state,
        'billingInformation.city': req.body.city,
        'billingInformation.street': req.body.street,
        'billingInformation.zipCode': req.body.zipCode,
        'billingInformation.phoneNumber': req.body.phoneNumber,
        'billingInformation.accountNumber': req.body.accountNumber,
        'billingInformation.expiryDate': req.body.expiryDate,
        'billingInformation.nameOntheCard': req.body.nameOntheCard,
        'billingInformation.ccv': req.body.ccv
    });
    res.status(201).send(new ApiResponse(201, 'success', user));
};

//Retrive Operations
exports.findById = async(req, res, next) => {
    const { error } = validateId({ _id: req.params.id });
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    res.status(200).send(new ApiResponse(200, 'success', user));
};

exports.findAll = async(req, res, next) => {
    const user = await User.find();
    if (!user) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    res.status(200).send(new ApiResponse(200, 'success', user));
}

//Update Operation
exports.updateById = async(req, res, next) => {
    const { error } = validateWithId(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    //const subCategory = await SubCategory.findById(req.body.subCategoryId);
    //if (!subCategory) res.status(400).send(new ErrorResponse('400', 'Invalid Sub Category Id!'));
    const user = await User.findOneAndUpdate(req.params.id, {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        'billingInformation.state': req.body.state,
        'billingInformation.city': req.body.city,
        'billingInformation.street': req.body.street,
        'billingInformation.zipCode': req.body.zipCode,
        'billingInformation.phoneNumber': req.body.phoneNumber,
        'billingInformation.accountNumber': req.body.accountNumber,
        'billingInformation.expiryDate': req.body.expiryDate,
        'billingInformation.nameOntheCard': req.body.nameOntheCard,
        'billingInformation.ccv': req.body.ccv
    }, { new: true, useFindAndModify: true });
    user.save();
    res.status(200).send(new ApiResponse(200, 'success', user));
};

//Delete Operation
exports.removeById = async(req, res, next) => {
    const { error } = validateId({ _id: req.params.id });
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    res.status(200).send(new ApiResponse(200, 'success', user));
};

exports.addToCart = async(req, res, next) => {
    const { error } = validateShoppingCart(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    const item = await Item.findById(req.body.itemId);
    console.log()
    const newShoppingCart = { item: item };
    if (!item) res.status(400).send(new ErrorResponse('400', 'no content found!'));
    const user = await User.findByIdAndUpdate(req.body.userId, {
        $push: { shoppingCart: newShoppingCart }
    }, { new: true, useFindAndModify: true });
    res.status(200).send(new ApiResponse(200, 'success', user.shoppingCart));
};

//Retrive Operations
exports.findShoppingCarts = async(req, res, next) => {
    const { error } = validateId({ _id: req.params.id });
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    const shoppingCarts = user.shoppingCart;
    res.status(200).send(new ApiResponse(200, 'success', shoppingCarts));
};

exports.findOrders = async (req, res, next) => {
    const { error } = validateId({ _id: req.params.id });
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    const orders = user.order;
    res.status(200).send(new ApiResponse(200, 'success', orders));
};

exports.findOrdersOfSeller = async (req, res, next) => {
    const { error } = validateId({ _id: req.params.id });
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    let orders = [];

    const usersList = await User.find({'order.item.product.userId': req.params.id});
    if (!usersList) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    usersList.forEach((user) => {
        orders.push(user.order);
    });

    res.status(200).send(new ApiResponse(200, 'success', orders));
};

exports.updateOrderStatus = async (req, res, next) => {
    const { error } = validateUpdateOrderStatus(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));

    const user = await User.findById(req.body.userId);
    let newOrder = {};
    user.order.forEach((o) => {
        if(o._id == req.body.orderId){
            newOrder = o;
        }
    }); 
    
    if(!newOrder) return res.status(400).send(new ErrorResponse('400', 'no content found!'));

    if(user.role == "BUYER"){
        if(newOrder.orderStatus == "ORDERED" && req.body.orderStatus == "CANCELLED"){
            newOrder.orderStatus = "CANCELLED";
            newOrder.payment = "VOID"

            await User.findByIdAndUpdate(req.body.userId, {
                $pull: { order: { _id: req.body.orderId } } , 
            }, { new: true, useFindAndModify: true });
        
            const updateUser = await User.findByIdAndUpdate(req.body.userId, {
                $push: { order: newOrder }
            }, { new: true, useFindAndModify: true });
        
            res.status(200).send(new ApiResponse(200, 'success', updateUser));
        }
    }
    else if(user.role != "BUYER" && req.body.orderStatus != "CANCELLED") {
        newOrder.orderStatus = req.body.orderStatus;
        if(newOrder.orderStatus == "CANCELLED"){
            newOrder.payment = "VOID"
        }

        if(newOrder.orderStatus == "DELIVERED"){
            user.coupon.point += (newOrder.item.price + config.get('pointPerPerchaseAmount'));
            console.log(`user got : ${user.coupon.point}!!!`);
            user.save();
        }

        await User.findByIdAndUpdate(req.body.userId, {
            $pull: { order: { _id: req.body.orderId } } , 
        }, { new: true, useFindAndModify: true });
    
        const updateUser = await User.findByIdAndUpdate(req.body.userId, {
            $push: { order: newOrder }
        }, { new: true, useFindAndModify: true });
    
        res.status(200).send(new ApiResponse(200, 'success', updateUser));
    }

    return res.status(403).send(new ErrorResponse('403', 'Access Denied!'))
};

exports.removeFromCart = async (req, res, next) => {
    const { error } = validateRemoveShoppingCart(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    const user = await User.findByIdAndUpdate(req.body.userId, {
        $pull: { shoppingCart: { _id: req.body.shoppingCartId } }
    }, { new: true, useFindAndModify: true });
    res.status(200).send(new ApiResponse(200, 'success', user.shoppingCart));
};

exports.placeOrder = async(req, res, next) => {
    const { error } = validateOrderPlacement(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));

    let fncc = async function(reqItems) {
        let items = [];
        for (let h = 0; h < reqItems.length; h++) {
            const item = await Item.findById(reqItems[h]);
            console.log('e');
            if (!item) res.status(400).send(new ErrorResponse('400', 'no content found!'));
            items.push(item);
        }
        return items;
    };

    const items = await fncc(req.body.itemIds);

    const newAddress = await Address.findById(req.body.addressId);
    // let newOrderDetail = items; 
    const newOrder = { orderDetail: items, shippingAddress: newAddress, orderDate: Date.now() };
    console.log(newOrder);

    //placing an order inside user object.
    const user = await User.findByIdAndUpdate(req.body.userId, {
        $addToSet: { addresses: newAddress },
        $push: { order: newOrder }

    }, { new: true, useFindAndModify: true });

    //return item list inside order
    res.status(200).send(new ApiResponse(200, 'success', items));

}

exports.placeSingleOrder = async (req, res, next) => {
    const { error } = validateSingleOrderPlacement(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));

    const user = await User.findById(req.body.userId);

    const item = await Item.findById(req.body.itemId);
    if (!item) res.status(400).send(new ErrorResponse('400', 'no content found!'));

    const newAddress = await Address.findById(req.body.addressId);
    let newOrder = {};

    newOrder.item = item;
    newOrder.orderDate = Date.now();
    newOrder.shippingAddress = newAddress;
    newOrder.orderStatus = "ORDERED";
    newOrder.payment = "PAYED";

    if(user.coupon.point * config.get('dollarPerPoint') > newOrder.item.price) {
        let discardedCost = user.coupon.point * config.get('dollarPerPoint') - newOrder.item.price;
        let updatedPoint = user.coupon.point - (discardedCost / config.get('dollarPerPoint'));

        await User.findByIdAndUpdate(req.body.userId, {
            'coupon.point': updatedPoint
        }, { new: true, useFindAndModify: true });

        console.log(`${discardedCost} is taken from your coupon!!!`);
    }

    await User.findByIdAndUpdate(req.body.userId, {
        $addToSet: { addresses: newAddress },
        $push: { order: newOrder }

    }, { new: true, useFindAndModify: true });

    //removing shopping carts from the user object
    const updatedUser = await User.findByIdAndUpdate(req.body.userId, {
        $pull: { shoppingCart: { _id: req.body.shoppingCartId } }
    }, { new: true, useFindAndModify: true });

    res.status(200).send(new ApiResponse(200, 'success', updatedUser));

}

exports.buyNow = async (req, res, next) => {
    const { error } = validateBuyNow(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));

    const item = await Item.findById(req.body.itemId);
    if (!item) res.status(400).send(new ErrorResponse('400', 'no content found!'));

    const newAddress = await Address.findById(req.body.addressId);
    let newOrder = {};

    newOrder.item = item;
    newOrder.orderDate = Date.now();
    newOrder.shippingAddress = newAddress;
    newOrder.orderStatus = "ORDERED";
    newOrder.payment = "PAYED";

    const user = await User.findByIdAndUpdate(req.body.userId, {
        $addToSet: { addresses: newAddress },
        $push: { order: newOrder }

    }, { new: true, useFindAndModify: true });

    res.status(200).send(new ApiResponse(200, 'success', user));
}
