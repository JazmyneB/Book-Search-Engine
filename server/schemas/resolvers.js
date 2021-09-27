const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                .select('-__v -password')
                .populate('books')
                
                return userData
            }
            throw new AuthenticationError('Not logged in');
        }
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const usesr = await User.findOne({ email });
            if (!user){
                throw new AuthenticationError('Incorrect credentials');
              }
              const correctPw = await user.isCorrectPassword(password);
      
              if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
              }
              const token = signToken(user);
      
              return { token, user };
        },
        saveBook: async (parent, { bookData }, context) => {
            if (context.user){
                const user = await User.findByIdAndUpdate({ _id: context.user._id }, { $push: {savedBooks: bookData } }, { new: true });
                return user;
            }
            throw new AuthenticationError('Not logged in');
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const user = await User.findByIdAndUpdate({ _id: context.user._id}, {$pull: {saveBooks: { bookId: bookId } } }, { new: true });

                return user;
            }
            throw new AuthenticationError('Unable to Delete');
        }
    }
}

module.exports = resolvers;