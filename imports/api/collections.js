import { Mongo } from 'meteor/mongo';

Needs = new Mongo.Collection('needs');
Cares = new Mongo.Collection('cares');
Messages = new Mongo.Collection('messages');

export { Needs, Cares, Messages };
