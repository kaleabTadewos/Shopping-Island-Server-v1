const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const mongoose = require('mongoose');
const { User } = require('../models/user');
const { OrderDetail } = require('../models/orderDetail');
const { Item } = require('../models/item');
const ApiResponse = require('../models/apiResponse');
const ErrorResponse = require('../models/errorResponse');
const { validateId, validateWithOutId, validateWithId } = require('../models/request/user.request');


exports.insert = async(req, res, next) => {
    const { error } = validateWithOutId(req.body);
    if (error) return res.status(400).send(new ErrorResponse('400', error.details[0].message));
    console.log("one");
    let userExist = await User.findOne({ email: req.body.email });
    console.log("Two");
    if (userExist) return res.status(400).send('user already exist');

    const user = await User.create({
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        status: req.body.status,
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
        //email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        status: req.body.status,
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
    const product = await Product.findByIdAndRemove(req.params.id);
    if (!product) return res.status(404).send(new ErrorResponse('400', 'no content found!'));
    res.status(200).send(new ApiResponse(200, 'success', product));
};

exports.addToCart = async(req, res, next) => {

};
/* get a user. */
// exports.getUser = async function(request, response) {
//         const user = await User.findById(request.user._id).select('-password');
//         response.send(user);
//     }
//     /* register users. */
// exports.registerUser = async function(request, response) {
//     const { error } = validate(request.body);
//     if (error) return response.status(400).send(error.details[0].message);


//     let user = await User.findOne({ email: request.body.email });
//     if (user) return response.status(400).send('user already exist')

//     user = new User({
//         email: request.body.email,
//         password: request.body.password,
//         status: request.body.status,
//         role: request.body.role
//     })

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);

//     await user.save();

//     const token = user.generateAuthToken();
//     response.header('x-auth-token', token).send(_.pick(user, ['email', 'role', 'status']));
// }