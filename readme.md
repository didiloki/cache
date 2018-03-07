# Cache API Design

## Installation
You can install the dependencies using NPM or YARN

If you already have **NPM** or **YARN** installed you can install the package running the following command inside your project directory.

```
npm install 
```

```
yarn install 
```

## How to use
To use this application the following are required: 
Run ``` npm start``` 

There are two routes in this application:
```
POST /cache/new
```
```
GET /cache/show/all
```
```
DELETE /cache/delete/:key
```
```
DELETE /cache/delete
```
```
PUT /cache/update/:key
```
```
GET /cache/:key
```
route takes a body like this

```JSON
{
	"name": "walker",
	"key" : "keu"
}
```

