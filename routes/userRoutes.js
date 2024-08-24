const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgetpassword', authController.forgetPassword);
router.patch('/resetpassword/:token', authController.resetPassword);
router.use(authController.protect);
router.patch(
  '/updatepassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateme', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.get(
  '/me',
  authController.protect,
  userController.getMe,
  userController.getUser
);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
