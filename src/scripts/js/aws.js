module.exports = (function() {

  function buildCognitoCredentialsParams(loginParams) {
    var logins = {};
    if (loginParams && loginParams['www.amazon.com']) {
      logins['www.amazon.com'] = loginParams['www.amazon.com'];
    }
    if (loginParams && loginParams['accounts.google.com']) {
      logins['accounts.google.com'] = loginParams['accounts.google.com'];
    }
    return {
      IdentityPoolId: 'eu-west-1:d2a5d076-b662-4095-a332-56be6bb38bd5',
      Logins: logins
    };
  }

  // Initialize the Amazon Cognito credentials provider
  AWS.config.region = 'eu-west-1'; // Region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(
    buildCognitoCredentialsParams());

  function setGoogleLogin(updatedToken) {
    //AWS.config.credentials.params.Logins['accounts.google.com'] = updatedToken;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(
      buildCognitoCredentialsParams({
        'accounts.google.com': updatedToken
      }));
    // manually expire credentials so next request will fire a refresh()
    AWS.config.credentials.expired = true;
    // manually call refresh() now to avoid waiting a request - NOT RECOMMENDED
    AWS.config.credentials.refresh(function(e) {
      if (e) {
        console.error(e);
      }
    });
    console.log('Updated google login token');
    console.log(AWS.config.credentials);
  }

  function listTestData() {
    new AWS.S3().getObject({ Bucket: 'aws-spito-data', Key: '__auth__/auth.txt' },
      function(err, data) {
        if (err) {
          console.error(err);
        } else {
          console.log(data);
          document.querySelector('#test-data').innerHTML = '<p>' + data.Body +
            '</p>'
        }
      });
  }

  /**
   * Export the public API for the public.
   */
  return {
    setGoogleLogin: setGoogleLogin,
    checkTestData: listTestData,
  };
})();
