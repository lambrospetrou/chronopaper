var CPAws = (function() {

	// Initialize the Amazon Cognito credentials provider
	AWS.config.region = 'eu-west-1'; // Region
	AWS.config.credentials = new AWS.CognitoIdentityCredentials({
	    IdentityPoolId: 'eu-west-1:d2a5d076-b662-4095-a332-56be6bb38bd5',
	    Logins: { // optional tokens, used for authenticated login
	    	'www.amazon.com': 'AMAZONTOKEN',
	        'accounts.google.com': 'GOOGLETOKEN'
	    }
	});
	

	function setGoogleLogin(updatedToken) {
		AWS.config.credentials.params.Logins['accounts.google.com'] = updatedToken;
		console.log('Updated google login token');
	}

	/**
	 * Export the public API for the public.
	 */
	 return {
	 	setGoogleLogin: setGoogleLogin
	 };
})();
