import { Meteor } from 'meteor/meteor';
import { Books, Requests, Messages } from '/imports/api/collections';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  registerUser(user) {
    Accounts.createUser({
      email: user.email,
      username: user.username,
      password: user.password
    });
  },

  insertBook: theBook => {
    const user = Meteor.user();
    if (!user) {
      return false;
    }
    const currentUserId = user._id;

    // const bookExists = Books.findOne({
    //   b_title_lowercase: theBook.b_title_lowercase,
    //   added_by: currentUserId,
    // });

    // if (bookExists) {
    //   throw new Meteor.Error('You have already added a book with same title');
    // }

    const myBook = {
      date_added: new Date(),
      b_title: theBook.title,
      b_title_lowercase: theBook.title.toLowerCase(),
      b_author: theBook.authors && theBook.authors[0],
      b_author_lowercase: theBook.authors && theBook.authors[0].toLowerCase(),
      b_lang: theBook.language || '',
      image_url: theBook.imageLinks && theBook.imageLinks.thumbnail,
      b_cat: (theBook.categories && theBook.categories[0]) || '',
      b_ISBN: theBook.industryIdentifiers && theBook.industryIdentifiers[0],
      selfLinkGoogle: theBook.selfLink,
      added_by: currentUserId,
      owner_name: user.username,
      // owner_profile_image_url: user.profile.image_url,
      x_times: 0,
      is_available: true
    };

    const bookId = Books.insert(myBook, function(error, result) {
      if (error) {
        console.log(error, 'error!');
      } else {
        return bookId;
      }
    });
  },

  makeRequest: bookId => {
    const currentUserId = Meteor.userId();
    if (!currentUserId) {
      return false;
    }

    try {
      const theBook = Books.findOne(bookId);
      const currentUser = Meteor.user();
      const owner = Meteor.users.findOne(theBook.added_by);

      if (Requests.findOne({ req_b_id: bookId, req_by: currentUserId })) {
        throw new Meteor.Error('You have already requested this item');
      }

      const reqId = Requests.insert({
        req_b_id: bookId,
        req_by: currentUserId,
        req_from: theBook.added_by,
        book_name: theBook.b_title,
        book_author: theBook.b_author,
        owner_name: theBook.owner_name,
        requester_name: currentUser.username,
        book_image_url: theBook.image_url || null,
        owner_profile_image: (owner.profile && owner.profile.image_url) || null,
        requester_profile_image:
          currentUser.profile || currentUser.profile.image_url || null,
        date_requested: new Date()
      });
      Messages.insert({
        req_id: reqId,
        borrower_id: currentUserId,
        lender_id: theBook.added_by,
        is_seen_by_other: false,
        messages: new Array()
      });

      Books.update(bookId, {
        $set: {
          on_request: true,
          is_available: false
        }
      });

      return reqId;

      const subjectEmail = 'Someone is interested in reading your book';
      var textEmail =
        'Hi ' +
        ownerName +
        '. ' +
        requesterName +
        ' has requested to borrow a book from you. Please go ahead and reply at: https://app.pomegra.org/my-requests/';
      Meteor.call('sendEmail', ownerId, subjectEmail, textEmail);
      return 'success';
    } catch (error) {
      return error;
    }
  },

  acceptRequest: reqId => {
    const currentUserId = Meteor.userId();

    if (!currentUserId) {
      return false;
    }

    const req = Requests.findOne(reqId);
    if (req.req_from !== currentUserId) {
      return false;
    }

    try {
      Requests.update(
        { _id: reqId },
        {
          $set: {
            is_confirmed: new Date(),
            is_replied_and_not_seen: true
          }
        }
      );

      Books.update(
        { _id: bookId },
        {
          $set: {
            on_request: false,
            on_acceptance: true
          }
        }
      );
      return;
    } catch (error) {
      return error;
    }

    const subjectEmail = 'Your request has been accepted!';
    const textEmail = `Congratulations! One of your requests has been accepted. Check at: https://app.pomegra.org/request/${reqId}`;
    Meteor.call('sendEmail', borrowerId, subjectEmail, textEmail);
  },

  denyRequest: reqId => {
    const currentUserId = Meteor.userId();

    if (!currentUserId) {
      return false;
    }

    const request = Requests.findOne(reqId);
    if (request.req_from !== currentUserId) {
      return false;
    }

    Requests.update(
      { _id: reqId },
      {
        $set: {
          is_denied: new Date()
        }
      }
    );

    Books.update(
      { _id: request.req_b_id },
      {
        $set: {
          on_request: false,
          is_available: true
        }
      }
    );
  },

  isHanded: reqId => {
    const currentUserId = Meteor.userId();

    if (!currentUserId) {
      return false;
    }

    const request = Requests.findOne(reqId);
    if (request.req_from !== currentUserId) {
      return false;
    }

    Requests.update(
      { _id: reqId },
      {
        $set: {
          is_handed: new Date()
        }
      }
    );

    Books.update(
      { _id: request.req_b_id },
      {
        $set: {
          on_acceptance: false,
          on_lend: true
        }
      }
    );
  },

  isReturned: reqId => {
    const currentUserId = Meteor.userId();

    if (!currentUserId) {
      return false;
    }

    const request = Requests.findOne(reqId);
    if (request.req_from !== currentUserId) {
      return false;
    }

    Requests.update(
      { _id: reqId },
      {
        $set: {
          is_returned: new Date()
        }
      }
    );

    Books.update(
      { _id: request.req_b_id },
      {
        $set: {
          on_lend: false,
          returned: true,
          is_available: true
        },
        $inc: {
          x_times: 1
        }
      }
    );
  },

  abortRequest: reqId => {
    const currentUserId = Meteor.userId();

    if (!currentUserId) {
      return false;
    }

    const request = Requests.findOne(reqId);
    if (request.req_from !== currentUserId) {
      return false;
    }

    Requests.update(
      { _id: reqId },
      {
        $set: {
          is_archived: true,
          is_aborted: true
        }
      }
    );

    Books.update(
      { _id: request.req_b_id },
      {
        $set: {
          is_available: true
        }
      }
    );
  },

  addMessage: (requestId, message) => {
    const currentUserId = Meteor.userId();
    currentUser = Meteor.user();
    if (!currentUserId) {
      return false;
    }
    const theMessage = Messages.findOne({
      req_id: requestId
    });
    if (
      currentUserId !== theMessage.lender_id &&
      currentUserId !== theMessage.borrower_id
    ) {
      return;
    }
    try {
      const Message = Messages.findOne({ req_id: requestId });
      Messages.update(
        { req_id: requestId },
        {
          $push: {
            messages: {
              text: message,
              from: currentUserId,
              date: new Date(),
              senderName: currentUser.username
            }
          },
          $set: {
            is_seen_by_other: false,
            last_msg_by: currentUserId
          }
        }
      );

      const unSeenIndex = Message.messages.length;
      Meteor.call('createNotification', 'request', requestId, unSeenIndex);
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }

    // let othersId;
    // const theRequest = Requests.findOne(requestId);
    // if (theRequest.owner_name === currentUser.username) {
    //   othersId = theRequest.req_by;
    // } else {
    //   othersId = theRequest.req_from;
    // }

    // if (
    //   Messages.findOne({
    //     is_seen_by_other: false,
    //     req_id: requestId
    //   })
    // ) {
    // const myName = Meteor.user().username;
    // const subjectEmail = 'You have a new message!';
    // const textEmail = `You received a new message from ${myName}. You can see and reply here: https://app.pomegra.org/request/${requestId}`;
    // Meteor.call('sendEmail', othersId, subjectEmail, textEmail);
    // }
  },

  createNotification(contextName, contextId, unSeenIndex) {
    const currentUser = Meteor.user();
    if (!currentUser) {
      throw new Meteor.Error('Not allowed!');
    }
    try {
      if (contextName !== 'request') {
        return;
      }
      const theRequest = Requests.findOne(contextId);
      const theOthersId =
        theRequest.req_by === currentUser._id
          ? theRequest.req_from
          : theRequest.req_by;
      const theOther = Meteor.users.findOne(theOthersId);

      const contextIdIndex =
        theOther.notifications &&
        theOther.notifications.findIndex(
          notification => notification.contextId === contextId
        );

      if (contextIdIndex !== -1) {
        const notifications = [...theOther.notifications];
        notifications[contextIdIndex].count += 1;
        if (!notifications[contextIdIndex].unSeenIndexes) {
          return;
        }
        notifications[contextIdIndex].unSeenIndexes.push(unSeenIndex);
        Meteor.users.update(theOther._id, {
          $set: {
            notifications: notifications
          }
        });
      } else {
        Meteor.users.update(theOther._id, {
          $push: {
            notifications: {
              title: theOther.username,
              count: 1,
              context: contextName,
              contextId: contextId,
              unSeenIndexes: [unSeenIndex]
            }
          }
        });
      }
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }
  },

  removeNotification(contextName, contextId, messageIndex) {
    const currentUser = Meteor.user();
    if (!currentUser) {
      throw new Meteor.Error('Not allowed!');
    }

    try {
      const notifications = [...currentUser.notifications];
      if (!notifications) {
        return;
      }

      const notificationIndex = notifications.findIndex(
        notification => notification.contextId === contextId
      );

      if (notificationIndex < 0) {
        return;
      }

      let onlyOneCount = false;
      if (notifications[notificationIndex].count === 1) {
        onlyOneCount = true;
      }

      if (onlyOneCount) {
        notifications.filter(
          notification => notification.contextId !== contextId
        );
      } else {
        notifications[notificationIndex].count -= 1;
        notifications[notificationIndex].unSeenIndexes.filter(
          unSeenIndex => unSeenIndex !== messageIndex
        );
      }

      Meteor.users.update(currentUser._id, {
        $set: {
          notifications: notifications
        }
      });
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }
  }
});

// PUBLICATIONS

// USER
Meteor.publish('me', function() {
  const userId = this.userId;
  if (userId) {
    return Meteor.users.find(userId);
  }
});

// BOOKS
Meteor.publish('myBooks', function() {
  const currentUserId = this.userId;
  return Books.find({
    added_by: currentUserId
  });
});

Meteor.publish('othersBooks', function() {
  const currentUserId = this.userId;
  if (currentUserId) {
    return Books.find(
      {
        added_by: { $ne: currentUserId }
      },
      { limit: 20 }
    );
  } else {
    return Books.find({}, { limit: 20 });
  }
});

Meteor.publish('singleBook', function(bookId) {
  return Books.find({
    _id: bookId
  });
});

// REQUESTS
Meteor.publish('myRequests', function() {
  var currentUserId = this.userId;
  return Requests.find({
    $or: [{ req_by: currentUserId }, { req_from: currentUserId }]
  });
});

Meteor.publish('singleRequest', function(reqId) {
  var currentUserId = this.userId;
  return Requests.find({
    _id: reqId,
    $or: [{ req_by: currentUserId }, { req_from: currentUserId }]
  });
});

Meteor.publish('myMessages', function(reqId) {
  var currentUserId = this.userId;
  return Messages.find({
    req_id: reqId,
    $or: [{ borrower_id: currentUserId }, { lender_id: currentUserId }]
  });
});
