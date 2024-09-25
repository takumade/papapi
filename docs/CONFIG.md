# Configurations

The `default.json` file contains the default configurations for the server which will be used locally in development or when you are not using a production environment.

The `production.json` file contains the configurations for the server which will be used in production.

Dont forget to change the secret among other important things.

## General Configuration
Change the URLs and so forth. Remember this is based on Feathers JS so you can even add more settings if you want. But if something breaks you are own your own problem. 

## Authentication
Change the secret in the config file. By default Papapi used local authentication.

## Database Configuration
To configure the database, you need to add the following to the config file:

```json
"mysql": "mysql://<username>:<password>@localhost:3306/<database-name>"
```

Go to `sequelize.ts` and uncomment that 'sync' line:

```typescript
const sequelize = new Sequelize(connectionString, {
    dialect: 'mysql',
    logging: true,
    // sync: { force: true },
    define: {
      freezeTableName: true
    }
});
```

Hit `npm run dev` to start the server. This will create tables in the database.

Stop the server and recomment that line. **Never uncomment that line in production.** You will lose data and cry like 5 year old that has dropped his ice cream.
