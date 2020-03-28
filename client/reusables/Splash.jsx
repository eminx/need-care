import React, { Component, PureComponent, Fragment } from 'react';
import {
  Hero,
  HeroBody,
  HeroFooter,
  Container,
  Title,
  Content,
  Button,
  Subtitle,
  Media,
  Table,
  Field,
  Control,
  Input,
  Image,
  TextArea,
  Help,
  Label,
  Select,
  Notification,
  Tag,
  Delete,
  MediaLeft,
  MediaContent
} from 'bloomer';
import { Flex, ImagePicker, ActivityIndicator } from 'antd-mobile';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import allLanguages from '../allLanguages';
import { resizeImage, dataURLtoFile } from '../functions';
import { HeroHeader } from 'bloomer/lib/layout/Hero/HeroHeader';

const googleApi = 'https://www.googleapis.com/books/v1/volumes?q=';

function uploadProfileImage(image, callback) {
  const upload = new Slingshot.Upload('profileImageUpload');

  upload.send(image, (error, downloadUrl) => {
    if (error) {
      callback(error);
    } else {
      callback(error, downloadUrl);
    }
  });
}

const introSlides = [
  {
    title: 'Virtualise your library',
    subtitle:
      'get to see the books people have in short distance to you, and borrow',
    color: 'info'
  },
  {
    title: 'Inspire and Discover Books',
    subtitle:
      'get to see the books people have in short distance to you, and borrow',
    color: 'primary'
  },
  {
    title: 'Let People Read More',
    subtitle:
      'get borrow requests from interesting readers in your city, become a librarian',
    color: 'success'
  }
];

const HeroSlide = ({ title, subtitle, color, children, ...otherProps }) => (
  <Hero
    isFullHeight
    isBold
    isColor={color}
    isPaddingless={false}
    {...otherProps}
  >
    <HeroBody>
      <Container>
        {title && <Title isSize={2}>{title}</Title>}
        {subtitle && <Subtitle isSize={4}> {subtitle}</Subtitle>}
        {children}
      </Container>
    </HeroBody>
  </Hero>
);

class Splash extends PureComponent {
  state = {
    carouselIndex: 0,
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    bio: '',
    languages: [],
    avatar: null,
    cover: null,
    savingAvatar: false,
    savingCover: false,
    searchValue: '',
    searchResults: null,
    isSearching: false
  };

  componentDidUpdate(prevProps, prevState) {
    const { currentUser } = this.props;
    if (!prevProps.currentUser && currentUser) {
      this.goNext();
    }
  }

  handleSlideChange = index => {
    this.setState({
      carouselIndex: index
    });
  };

  isSliderDisabled = () => {
    const { carouselIndex } = this.state;
    if ([6, 7, 8].includes(carouselIndex)) return true;
    if ([0, 1, 2].includes(carouselIndex)) return false;
    return (
      this.isEmailInvalid() ||
      this.isUsernameInvalid() ||
      this.isPasswordInvalid()
    );
  };

  goNext = () => {
    this.slider.slickNext();
  };

  isEmailInvalid = () => {
    const { email } = this.state;
    return !validateEmail(email);
  };

  isUsernameInvalid = () => {
    const { username } = this.state;
    return username.length < 6;
  };

  isPasswordInvalid = () => {
    const { password } = this.state;
    return password.length < 6;
  };

  handleCreateAccount = () => {
    const { email, username, password } = this.state;
    const values = {
      email,
      username,
      password
    };
    this.props.createAccount(values);
  };

  handleInfoFormSubmit = form => {};

  handleLanguageSelect = event => {
    const { languages } = this.state;
    const selectedLanguageValue = event.target.value;

    const selectedLanguage = allLanguages.find(
      language => language && language.value === selectedLanguageValue
    );

    const newLanguages = [...languages, selectedLanguage];
    this.setState({
      languages: newLanguages
    });
  };

  handleRemoveLanguage = language => {
    const { languages } = this.state;
    const languageValue = language.value;

    const newLanguages = languages.filter(
      language => languageValue !== language.value
    );
    this.setState({
      languages: newLanguages
    });
  };

  saveInfo = () => {
    const { firstName, lastName, bio, languages } = this.state;
    const values = {
      firstName,
      lastName,
      bio
    };

    Meteor.call('updateProfile', values, languages, (error, respond) => {
      if (error) {
        console.log(error);
        errorDialog(error.reason);
      } else {
        // successDialog('Values are successfu');
        this.goNext();
        return;
      }
    });
  };

  handleAvatarPick = (images, type, index) => {
    this.setState({
      avatar: images[0]
    });
  };

  handleCoverPick = (images, type, index) => {
    this.setState({
      cover: images[0]
    });
  };

  saveAvatar = () => {
    const { avatar } = this.state;

    this.setState({
      savingAvatar: true
    });

    resizeImage(avatar, 180, uri => {
      const uploadableImage = dataURLtoFile(uri, avatar.file.name);
      uploadProfileImage(uploadableImage, (error, respond) => {
        if (error) {
          console.log('error!', error);
          errorDialog(error.reason);
          return;
        }
        const avatarToSave = {
          name: avatar.file.name,
          url: respond,
          uploadDate: new Date()
        };
        Meteor.call('setNewAvatar', avatarToSave, (error, respond) => {
          if (error) {
            console.log(error);
            errorDialog(error.reason);
            return;
          }
          this.setState({
            savingAvatar: false
          });
          this.goNext();
        });
      });
    });
  };

  saveCover = () => {
    const { cover } = this.state;

    this.setState({
      savingCover: true
    });

    resizeImage(cover, 600, uri => {
      const uploadableImage = dataURLtoFile(uri, cover.file.name);
      uploadProfileImage(uploadableImage, (error, respond) => {
        if (error) {
          console.log('error!', error);
          errorDialog(error.reason);
          return;
        }
        const coverToSave = {
          name: cover.file.name,
          url: respond,
          uploadDate: new Date()
        };
        Meteor.call('setNewCoverImages', [coverToSave], (error, respond) => {
          if (error) {
            console.log(error);
            errorDialog(error.reason);
            return;
          }
          this.setState({
            savingCover: false
          });
          this.goNext();
        });
      });
    });
  };

  searchBook = event => {
    event && event.preventDefault();
    const { searchValue } = this.state;
    console.log(searchValue);

    this.setState({
      isSearching: true
    });

    fetch(googleApi + searchValue)
      .then(results => {
        return results.json();
      })
      .then(parsedResults => {
        this.setState({
          isLoading: false,
          searchResults: parsedResults.items
        });
      });
  };

  render() {
    const { currentUser } = this.props;
    const {
      carouselIndex,
      email,
      username,
      password,
      firstName,
      lastName,
      bio,
      languages,
      avatar,
      savingAvatar,
      cover,
      savingCover,
      searchValue,
      searchResults,
      isSearching
    } = this.state;

    const isEmailInvalid = this.isEmailInvalid();
    const isUsernameInvalid = this.isUsernameInvalid();
    const isPasswordInvalid = this.isPasswordInvalid();

    return (
      <Slider
        ref={component => (this.slider = component)}
        arrows={![0, 1, 2].includes(carouselIndex)}
        dots={![0, 1, 2].includes(carouselIndex)}
        afterChange={this.handleSlideChange}
        // swipe={!this.isSliderDisabled()}
        infinite={false}
      >
        {introSlides.map(slide => (
          <HeroSlide
            key={slide.title}
            color={slide.color}
            title={slide.title}
            subtitle={slide.subtitle}
          ></HeroSlide>
        ))}

        {!currentUser && (
          <HeroSlide subtitle="Enter your private email address" color="dark">
            <Fragment>
              <Field>
                <Control>
                  <Input
                    type="email"
                    placeholder="email address"
                    value={email}
                    onChange={event =>
                      this.setState({ email: event.target.value })
                    }
                    isSize="large"
                    className="is-rounded"
                    style={{ color: '#3e3e3e' }}
                    isColor={
                      email.length === 0
                        ? 'info'
                        : isEmailInvalid
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Control>
              </Field>

              <Button
                disabled={isEmailInvalid}
                onClick={this.goNext}
                className="is-rounded"
                isPulled="right"
              >
                Next
              </Button>
            </Fragment>
          </HeroSlide>
        )}

        {!currentUser && (
          <HeroSlide subtitle="Create a username" color="dark">
            <Fragment>
              <Field>
                <Control>
                  <Input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={event =>
                      this.setState({ username: event.target.value })
                    }
                    isSize="large"
                    className="is-rounded"
                    style={{ color: '#3e3e3e' }}
                    isColor={
                      username.length === 0
                        ? 'info'
                        : isUsernameInvalid
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Control>
                <Help
                  isColor={
                    username.length === 0
                      ? 'info'
                      : isUsernameInvalid
                      ? 'warning'
                      : 'success'
                  }
                >
                  {username.length === 0
                    ? null
                    : isUsernameInvalid
                    ? 'username is not available'
                    : 'username is available'}
                </Help>
              </Field>

              <Button
                disabled={isUsernameInvalid}
                onClick={this.goNext}
                className="is-rounded"
                isPulled="right"
              >
                Next
              </Button>
            </Fragment>
          </HeroSlide>
        )}

        {!currentUser && (
          <HeroSlide subtitle="Create a password" color="dark">
            <Fragment>
              <Field>
                <Control>
                  <Input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={event =>
                      this.setState({ password: event.target.value })
                    }
                    isSize="large"
                    className="is-rounded"
                    style={{ color: '#3e3e3e' }}
                    isColor={
                      password.length === 0
                        ? 'info'
                        : isUsernameInvalid
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Control>
                <Help isColor={isPasswordInvalid ? 'warning' : 'success'}>
                  {isPasswordInvalid ? 'not strong enought' : 'looks great'}
                </Help>
              </Field>
              <Button
                disabled={isPasswordInvalid}
                onClick={this.handleCreateAccount}
                className="is-rounded"
                isPulled="right"
                isSize="large"
                isColor="success"
              >
                Create
              </Button>
            </Fragment>
          </HeroSlide>
        )}

        <HeroSlide subtitle="Let's now add up some info for your profile">
          {currentUser && (
            <InfoForm
              firstName={firstName}
              lastName={lastName}
              bio={bio}
              onFirstNameChange={e =>
                this.setState({ firstName: e.target.value })
              }
              onLastNameChange={e =>
                this.setState({ lastName: e.target.value })
              }
              onBioChange={e => this.setState({ bio: e.target.value })}
              onSubmitInfoForm={this.goNext}
            />
          )}
        </HeroSlide>

        <HeroSlide subtitle="What languages do you speak?">
          {currentUser && (
            <Field>
              <Label>Select:</Label>
              <Control>
                <Select onChange={this.handleLanguageSelect}>
                  {allLanguages.map(language => (
                    <option key={language.value} value={language.value}>
                      {language.label}
                    </option>
                  ))}
                </Select>
              </Control>
              <Flex wrap="wrap">
                {languages.map(language => (
                  <Tag
                    key={language.value}
                    value={language.value}
                    isColor="warning"
                    isSize="small"
                    style={{ marginTop: 12, marginRight: 12 }}
                  >
                    {language.label}{' '}
                    <Delete
                      isSize="medium"
                      onClick={() => this.handleRemoveLanguage(language)}
                    />
                  </Tag>
                ))}
              </Flex>

              <Control style={{ paddingTop: 24 }}>
                <Button
                  disabled={languages.length === 0}
                  onClick={this.saveInfo}
                  className="is-rounded"
                  isPulled="right"
                >
                  Save and Continue{' '}
                </Button>
              </Control>
            </Field>
          )}
        </HeroSlide>

        <HeroSlide subtitle="Great! Now let's get avatar for you">
          <Field>
            <div style={{ maxWidth: 160, margin: '0 auto' }}>
              <ImagePicker
                files={avatar ? [avatar] : []}
                onChange={this.handleAvatarPick}
                selectable={!avatar}
                accept="image/jpeg,image/jpg,image/png"
                multiple={false}
                length={1}
              />
            </div>

            <Control style={{ paddingTop: 24 }}>
              <Button
                disabled={!avatar || savingAvatar}
                onClick={this.saveAvatar}
                className="is-rounded"
                isPulled="right"
              >
                {savingAvatar ? 'Saving Avatar...' : 'Save Avatar'}
                <ActivityIndicator animating={savingAvatar} />
              </Button>
            </Control>
          </Field>
        </HeroSlide>

        <HeroSlide subtitle="Awesome! Now let's get a cover image">
          <Field>
            <ImagePicker
              files={cover ? [cover] : []}
              onChange={this.handleCoverPick}
              selectable={!cover}
              accept="image/jpeg,image/jpg,image/png"
              multiple={false}
              length={1}
            />

            <Control style={{ paddingTop: 24 }}>
              <Button
                disabled={!cover || savingCover}
                onClick={this.saveCover}
                className="is-rounded"
                isPulled="right"
              >
                {savingCover ? 'Saving cover image...' : 'Save Cover Image'}
                <ActivityIndicator animating={savingCover} />
              </Button>
            </Control>
          </Field>
        </HeroSlide>

        <HeroSlide isPaddingless isColor="dark" hasTextColor="light">
          <div style={{ position: 'relative' }}>
            <div
              style={
                currentUser &&
                currentUser.coverImages &&
                currentUser.coverImages[0] &&
                slideStyle(currentUser.coverImages[0].url)
              }
            >
              <Image
                isSize="128x128"
                src={
                  currentUser && currentUser.avatar && currentUser.avatar.url
                }
                className="is-rounded"
                style={{ position: 'absolute', top: '30vh' }}
              />
            </div>
          </div>
          <Field style={{ marginTop: '50vh' }}>
            <Control style={{ paddingTop: 24 }}>
              <Subtitle isSize={6}>
                Now, let's add some books from your library
              </Subtitle>
              <Button
                onClick={this.saveCover}
                className="is-rounded"
                isPulled="right"
                isSize="large"
                isColor="success"
              >
                Add Books
              </Button>
            </Control>
          </Field>
        </HeroSlide>

        <HeroSlide
          subtitle="What book are you reading now?"
          isColor="dark"
          hasTextColor="light"
        >
          <form onSubmit={this.searchBook}>
            <Field>
              <Control>
                <Input
                  type="test"
                  placeholder="book title, author, ISBN etc"
                  value={searchValue}
                  onChange={event =>
                    this.setState({ searchValue: event.target.value })
                  }
                  className="is-rounded"
                  hasTextColor="dark"
                />
              </Control>
            </Field>
            {/* <Help isColor={isPasswordInvalid ? 'warning' : 'success'}>
                  {isPasswordInvalid ? 'not strong enought' : 'looks great'}
                </Help> */}
            <Field>
              <Control>
                <Button
                  onClick={this.searchBook}
                  className="is-rounded"
                  isPulled="right"
                  isColor="dark"
                  isOutlined
                  hasTextColor="light"
                  style={{ borderColor: '#f6f6f6' }}
                >
                  Search
                </Button>
              </Control>
            </Field>
          </form>
          <div isClearFix>
            {searchResults &&
              searchResults.map(result => (
                <BookCard
                  key={result.volumeInfo.title}
                  volumeInfo={result.volumeInfo}
                />
              ))}
          </div>
        </HeroSlide>
      </Slider>
    );
  }
}

const slideStyle = backgroundImage => ({
  position: 'absolute',
  width: '100vw',
  height: '40vh',
  top: '-3rem',
  left: '-1.5rem',
  backgroundImage: `url('${backgroundImage}')`,
  backgroundOosition: 'center',
  backgroundSize: 'cover',
  touchAction: 'none'
});

function validateEmail(email) {
  var re = /\S+@\S+\.\S+/;
  return re.test(email);
}

const InfoForm = ({
  firstName,
  lastName,
  bio,
  onFirstNameChange,
  onLastNameChange,
  onBioChange,
  onSubmitInfoForm
}) => (
  <Fragment>
    <Field>
      <Control>
        <Input
          type="text"
          placeholder="first name"
          value={firstName || ''}
          onChange={onFirstNameChange}
          // className="is-rounded"
          style={{ color: '#3e3e3e' }}
        />
      </Control>
    </Field>

    <Field>
      <Control>
        <Input
          type="text"
          placeholder="last name"
          value={lastName || ''}
          onChange={onLastNameChange}
          // className="is-rounded"
          style={{ color: '#3e3e3e' }}
        />
      </Control>
    </Field>

    <Field>
      <Control>
        <TextArea
          type="text"
          placeholder="bio"
          onChange={onBioChange}
          // className="is-rounded"
          style={{ color: '#3e3e3e', borderRadius: 20 }}
          value={bio || ''}
        />
      </Control>
    </Field>

    <Field>
      <Button
        onClick={onSubmitInfoForm}
        className="is-rounded"
        isPulled="right"
      >
        Next
      </Button>
    </Field>
  </Fragment>
);

const BookCard = ({ volumeInfo }) => (
  <div
    style={{
      backgroundColor: '#F6F6F6',
      padding: 24,
      marginBottom: 24,
      boxShadow: '0 0 5px'
    }}
  >
    <Title hasTextColor="dark" isSize={5}>
      {volumeInfo.title}
    </Title>
    <Subtitle hasTextColor="dark" isSize={6}>
      {volumeInfo.authors && volumeInfo.authors[0]}
    </Subtitle>
    <div>
      <div style={{ color: '#3E3E3E', marginBottom: 12, textAlign: 'right' }}>
        <strong>
          <small>
            <em>
              {volumeInfo.publisher}, {volumeInfo.printType},{' '}
              {volumeInfo.publisher}
            </em>
          </small>
        </strong>
      </div>
      {/* <p>{volumeInfo.description}</p> */}

      <Flex wrap="wrap">
        <img
          src={volumeInfo.imageLinks.thumbnail}
          width={128}
          height={197}
          alt={volumeInfo.title}
          style={{ marginRight: 24 }}
        />
        <Table
          isBordered={false}
          isStriped={false}
          isNarrow={false}
          isPulled="right"
          style={{ backgroundColor: '#F6F6F6' }}
        >
          <tbody>
            <tr>
              <td>Category</td>
              <td>
                <strong>
                  {volumeInfo.categories && volumeInfo.categories[0]}
                </strong>
              </td>
            </tr>
            <tr>
              <td>Language</td>
              <td>
                <strong>{volumeInfo.language}</strong>
              </td>
            </tr>
            <tr>
              <td>ISBN</td>
              <td>
                {volumeInfo.industryIdentifiers &&
                  volumeInfo.industryIdentifiers[0].identifier}
              </td>
            </tr>
          </tbody>
        </Table>
      </Flex>
    </div>
  </div>
);

const parseAuthors = ({ authors }) => {
  authors ? (
    authors.map((author, index) => (
      <span key={author}>
        {author + (authors.length !== index + 1 ? ', ' : '')}
      </span>
    ))
  ) : (
    <span>'unknown authors'</span>
  );
};

export default Splash;
