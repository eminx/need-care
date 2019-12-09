import React from 'react';
import { App, View } from 'framework7-react';
import CreateAccountContainer from './CreateAccountContainer';
import BooksContainer from './BooksContainer';
import AddBookContainer from './AddBookContainer';
import BookDetailTobeAdded from './BookDetailTobeAdded';
import MyBookContainer from './MyBookContainer';
import MyBooksContainer from './MyBooksContainer';

const routes = [
  {
    name: 'add',
    path: '/add/',
    component: AddBookContainer,
  },
  {
    name: 'books',
    path: '/books/',
    component: BooksContainer,
  },
  {
    name: 'my-books',
    path: '/my-books/',
    component: MyBooksContainer,
  },
  {
    name: 'create-account',
    path: '/',
    component: CreateAccountContainer,
  },
  {
    name: 'book-detail-tobe-added',
    path: '/book-detail-tobe-added/',
    component: BookDetailTobeAdded,
  },
  {
    name: 'book-detail',
    path: '/book-detail/',
    component: MyBookContainer,
  },
];

const f7params = {
  routes,
  name: 'My App',
  id: 'com.myapp.test',
  theme: 'aurora',
};

export default () => (
  <App params={f7params}>
    <View main url="/" />
  </App>
);
