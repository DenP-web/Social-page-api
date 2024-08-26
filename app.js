const createError = require('http-errors');
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:5173', // Replace with your frontend domain
  credentials: true,
};

const { app } = require('./socket/socket');
const dirname = path.resolve();

// Middleware setup
app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'pug');

const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api', require('./routes'));

app.use(express.static(path.join(dirname, "/client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(dirname, "client", "dist", "index.html"));
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error'); // Ensure you have a view named 'error'
});

module.exports = app;
