import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import VisibilitySensor from 'react-visibility-sensor';

class ChatteryBubble extends React.Component {
  componentDidMount() {
    const { isFromMe, children } = this.props;
    if (!isFromMe) {
      this.removeNotification;
    }
  }

  parseDate = theDate => {
    const isToday = moment(theDate).isSame(moment(), 'd');
    const isYesterday = moment(theDate).isSame(moment().add(-1, 'days'), 'd');
    const isThisYear = moment(theDate).isSame(moment(), 'y');

    if (isToday) {
      return moment(theDate).format('[Today,] HH:mm');
    } else if (isYesterday) {
      return moment(theDate).format('[Yesterday,] HH:mm');
    } else if (isThisYear) {
      return moment(theDate).format('ddd, Do MMM, [at] HH:mm');
    } else {
      return moment(theDate).format("Do MMM [']YY, [at] HH:mm");
    }
  };

  removeNotification = isVisible => {
    const { isFromMe, removeNotification } = this.props;
    if (isVisible && !isFromMe) {
      removeNotification();
    }
  };

  render() {
    const {
      senderUsername,
      createdDate,
      isFromMe,
      isSeen,
      children
    } = this.props;
    let bubbleClass = 'talk-bubble tri-right round ';
    let bubbleClassContainer = 'talk-bubble-container ';
    if (isFromMe) {
      bubbleClass += 'right-in';
      bubbleClassContainer += 'right-in';
    } else {
      bubbleClass += 'left-in';
      bubbleClassContainer += 'left-in';
    }

    return (
      <div className={bubbleClassContainer}>
        <VisibilitySensor onChange={this.removeNotification}>
          {({ isVisible }) => (
            <div
              className={bubbleClass}
              // style={!isSeen ? { borderColor: '#ea3924' } : null}
            >
              <div className="talktext">
                <p className="talktext-senderinfo">{senderUsername}</p>
                <p className="talktext-content">{children}</p>
                <p className="talktext-dateinfo">
                  {this.parseDate(createdDate)}
                </p>
              </div>
            </div>
          )}
        </VisibilitySensor>
      </div>
    );
  }
}

ChatteryBubble.propTypes = {
  children: PropTypes.string.isRequired,
  createdDate: PropTypes.instanceOf(Date),
  sender: PropTypes.string,
  isSeen: PropTypes.bool
};

export { ChatteryBubble };
