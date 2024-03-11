import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import bodyParser from 'body-parser';
import cors from 'cors';
import 'dotenv/config';
import Express from 'express';
import helmet, { referrerPolicy } from 'helmet';
import { createServer } from 'http';
import _ from "lodash";
import mongoose from 'mongoose';
import resolvers from './graphql/resolvers/main.resolvers';
import typeDefs from './graphql/typeDefs';

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

const app = Express();

const startMongoConnecton = () => {
    if (_.isString(MONGO_URI)) {
        mongoose.connect(MONGO_URI).then(() => {
            console.log("Mongodb client connected");
        }).catch(err => {
            console.error("Error in mongodb connection", err);
        })
    }
};

const startApolloGraphqlServer = async () => {
    const httpServer = createServer(app);

    const apolloServer = new ApolloServer({
        typeDefs, resolvers,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    })

    app.use('/graphql', bodyParser.json(),
        bodyParser.urlencoded({ extended: true }),
        helmet(),
        referrerPolicy({ policy: 'same-origin' }),
        cors({ origin: '*', credentials: true }),
        expressMiddleware(apolloServer, {
            context: async ({ req }) => ({ token: req.headers.token })
        }));


    return new Promise<void>(function (resolve) {
        httpServer.listen(PORT, () => {
            resolve();
            console.log('Http Server started on PORT: ', PORT)
        })
    });
}

(async function () {
    await startMongoConnecton();
    await startApolloGraphqlServer();
})()