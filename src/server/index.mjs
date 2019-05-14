
import startServer from "@prisma-cms/server";

import Module, {
  getProjectFromRequest,
} from "../";


const module = new Module({
});

const resolvers = module.getResolvers();





startServer({
  typeDefs: 'src/schema/generated/api.graphql',
  resolvers,
  contextOptions: {
    getProjectFromRequest,
  },
});
