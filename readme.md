# Node API Configuration Guide
## Dependencies
> This server is implemented using the following libraries:
```sh
bcrypt
cors
crypto
dotenv
express
jsonwebtoken
mysql mysql2
node-forge
```
##### they can be installed through the app's `package.json` using **_npm install_**

## Database
> The database is accesed through an admin and an api user types; they can be generated with the following queries

```sql
    create database BAP;
    create user 'admin'@'%' identified by 'password_admin';
    grant select, create, drop, alter, create view, references on BAP.* to admin@'%';
    create user 'api'@'%' identified by 'password_api';
    grant insert, update, delete, select, show view on BAP.* to api@'%';
    flush privileges;
```

## Security
> This server comes with a self-signed certificate generator implementing **_node-forge_**; the server will search for a `private.key` and a `public.crt` keys and will generate a self-signed certificate when it fails to found them inside `./storage/`.


## Environamental variables
> The following environamental variables are needed in a `key=value` format inside a file named `.env` located in the root folder.

### app_key
- Used as secret key in token generation
- Can be generated with this forge method: 
```javascript
    forge.util.bytesToHex(forge.random.getBytesSync(16))
```

### production
 - Used as a flag to determine between setting an HTTP or and HTTP server

### initializeDB
 - Used as flag to determine wether to initialize the database

### port_app
 - Web port where the server will listen

### host
 - App host to be attached to the server
 - Used when generating self-signed certifgicates

### protocol
 - Used when generating self-signed certifgicates

### db_host
 - Host were the DB is located

### db_database
 - Name of database to use

### db_user
 - Username of the api user

### db_password
 - Password of the api user

### db_admin
 - Username of the admin user

### db_admin_password
 - Password of the admin user

## Documentation
> Method documentation is provided as a postman file `BAP.postman_collection.json`
