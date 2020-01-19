
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";
// import UserModule from "@prisma-cms/user-module";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema

import TemplateModule from "./Template";

class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    Object.assign(this, {
    });

    this.mergeModules([
      // UserModule,
      TemplateModule,
    ]);

  }


  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), []);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const {
      User,
      ...resolvers
    } = super.getResolvers();

    // console.log("resolvers 3.1 User", User);

    Object.assign(resolvers.Query, this.Query);

    Object.assign(resolvers.Mutation, {

      // marketplaceSignin: async (source, args, ctx, info) => {

      //   console.log("marketplaceSignin args", args);

      //   const {
      //     currentUser,
      //     db,
      //   } = ctx;

      //   const {
      //     id: currentUserId,
      //   } = currentUser || {};


      //   if (!currentUserId) {
      //     throw new Error("Please, login");
      //   }

      //   const query = `
      //     mutation signin (
      //       $where: UserWhereUniqueInput!
      //       $data: SigninDataInput!
      //     ){
      //       signin(
      //         where: $where
      //         data: $data
      //       ){
      //         success
      //         message
      //         errors{
      //           key
      //           message
      //         }
      //         token
      //         data{
      //           id
      //           username
      //         }
      //       }
      //     }
      //   `;

      //   const body = {
      //     query,
      //     variables: args,
      //   };

      //   const response = await fetch('http://localhost:4100', {
      //     method: 'POST',
      //     headers: {
      //       'Accept': 'application/json',
      //       'Content-Type': 'application/json'
      //     },
      //     body: JSON.stringify(body)
      //   })
      //     .then(rawResponse => {

      //       return rawResponse.json();
      //     })

      //   // console.log("response", response);

      //   const {
      //     success,
      //     message,
      //     errors,
      //     token,
      //   } = response.data.signin;

      //   /**
      //    * Если успешно, то обнавляем API-токен пользователя
      //    */

      //   // console.log("response success", success);
      //   // console.log("response token", token);

      //   if (success && token) {

      //     await db.mutation.updateUser({
      //       where: {
      //         id: currentUserId,
      //       },
      //       data: {
      //         marketplaceToken: token,
      //       },
      //     });
      //   }

      //   return {
      //     success,
      //     message,
      //     errors,
      //     data: token,
      //   }

      // },

    });

    Object.assign(resolvers.Subscription, this.Subscription);


    Object.assign(resolvers, {
      User: {
        ...User,
        marketplaceToken: (source, args, ctx, info) => {

          const {
            id: currentUserId,
          } = ctx.currentUser || {};

          const {
            id,
            marketplaceToken,
          } = source;

          return currentUserId && currentUserId === id ? marketplaceToken : null;
        },
      },
    });

    // console.log("resolvers 3 User", resolvers.User);

    return resolvers;
  }


}


export default Module;