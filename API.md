# MBU REST API

This file contains descriptions of API requests and responses for various 
endpoints, broken up by funtionality. 

**All endpoints are prefixed by `/api`.**

## Users

### Creation

* Method: `POST`
* Endpoint: `/signup`
* Request data: `email, password, firstname, lastname`
* Success: `token, profile`
* Failure: `message, error`

### Authentication

* Method: `POST`
* Endpoint: `/authenticate`
* Request data: `email, password`
* Success: `token, profile`
* Failure: `message, error`

### Retrieval

* Method: `GET`
* Endpoint: `/users?id=<id>`
* Success: `user`
* Failure: `message, error`

### Forgot Password Flow:

1. `POST /api/forgot` with body `{ email: <email> }`, sends token to email
2. `GET /api/reset/:token` to confirm validity of token (optional)
3. `POST /api/reset` with body `{ password: <password>, token: <token> }`

## Events

### Creation

* Method: `POST`
* Endpoint: `/api/events`
* Request data: `year, semester, price, date, registration_open, registration_close`
* Authorization: admin
* Success: `message, event`
* Failure: `message, error`

### Retrieval

* Method: `GET`
* Endpoint: `/api/events?<id, semester, year>`
* Success: `events`
* Failure: 404

## Update

* Method: `PUT`
* Endpoint: `/api/events/:id`
* Request date: `year, semester, price, date, registration_open, registration_close`
* Authorization: admin
* Success: `message, event`
* Failure: `message, error`

### Delete

* Method: `DELETE`,
* Endpoint: `/api/events/:id`,
* Authorization: admin,
* Success: 200,
* Failure: 400
