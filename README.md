# URL-SHORTENER
# URL Shortener (MERN Stack)

A full-stack URL Shortener built with the MERN stack following the MVC architecture. Users can register and log in using JWT authentication, create and manage short links, and track basic usage. The backend uses Node.js, Express, MongoDB, and JWT, while the frontend is built with React for a fast, responsive UI.


# URL Shortener Service

A simple URL shortener service that converts long URLs into short, shareable links.
It also tracks how many times each short URL is visited.

---

## Features

* Generate a short URL from a valid long URL
* Redirect users from short URL to original URL
* Track total clicks for each short URL
* REST API based design

---

## Base URL Example

```
https://example.com
```

---

## API Routes

### 1. Create Short URL

**POST** `/url`

**Request Body**

```json
{
  "originalUrl": "https://github.com/username/repository"
}
```

**Response**

```json
{
  "shortUrl": "https://example.com/itl9"
}
```

---

### 2. Redirect to Original URL

**GET** `/:id`

**Example**

```
GET https://example.com/itl9
```

**Behavior**

* Redirects to the original URL
* Increments click count

---

### 3. URL Analytics

**GET** `/url/analytics/:id`

**Example**

```
GET https://example.com/url/analytics/itl9
```

**Response**

```json
{
  "shortId": "itl9",
  "totalClicks": 42
}
```

---

## Tech Stack (Example)

* Node.js
* Express.js
* MongoDB
* Mongoose

---

## Use Cases

* Sharing long GitHub repository links
* Tracking link engagement
* URL management systems

---

## License

Internal Use Only

---

Feel free to fork and improve this project 🙂

