import { PrismaClient } from '@prisma/client';
import { ApolloServer, gql } from 'apollo-server-micro';
import { NextApiRequest, NextApiResponse } from 'next';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
  }
  type Query {
    hello: String
    users: [User]
  }
`;

interface Context {
  prisma: PrismaClient
}

const resolvers = {
  Query: {
    hello: () => 'Hello World',
    users: async (parent: undefined, args: {}, context: Context) => {
      return await context.prisma.user.findMany();
    }
  }
};
const prisma = new PrismaClient();

const apolloServer = new ApolloServer({
  typeDefs, 
  resolvers,
  context: {
    prisma
  }
});

const startServer = apolloServer.start();

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Origin',
    'https://studio.apollographql.com'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql'
  })(req, res);
}


