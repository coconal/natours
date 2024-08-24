const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/"(.*?)"/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = 'Invalid input data. ' + errors.join('. ');

  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleExpiredError = () => {
  return new AppError('Your token has expired! Please log in again!', 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.Status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    // unknown error
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR:', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.Status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    //name is not a enumerable property, so we have to copy it to a new object
    let error = { ...err };

    //console.log('error:', error);
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }

    if ((err.name = 'ValidationError')) {
      error = handleValidationErrorDB(err);
    }
    // verify token error
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (err.name === 'TokenExpiredError') {
      error = handleExpiredError();
    }

    sendErrorProd(error, res);
  }
};
