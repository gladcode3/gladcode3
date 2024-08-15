/*
how to include google login in your page:
1 - add the following tags in the php page:
	<meta name="google-signin-client_id" content="108043684563-uhl9ui9p47r5fadmu31mr3mmg7g4936n.apps.googleusercontent.com">
	<script src="https://apis.google.com/js/platform.js" async defer></script>
	<script type="text/javascript" src="script/googlelogin.js"></script>
	
2 - call initGoogleLogin function on the page load:

3 - call googleLogin to authenticate
	google_login().then( function(data){
		data = JSON.parse(data);
	});

	data contains a json with the following attributes:
	email: user email
	nome: user first name
	sobrenome: user last name
	foto: user picture
	pasta: folder name on the server
*/

function initGoogleLogin(){
	var googleUser = {};
	
	var gapiInt = setInterval(gapiReady, 10);
	
	function gapiReady() {
		if (typeof gapi !== 'undefined'){
			gapi.load('auth2', function(){
				// Retrieve the singleton for the GoogleAuth library and set up the client.
				auth2 = gapi.auth2.init({
					client_id: '108043684563-uhl9ui9p47r5fadmu31mr3mmg7g4936n.apps.googleusercontent.com',
					cookiepolicy: 'single_host_origin',
					// Request scopes in addition to 'profile' and 'email'
					//scope: 'additional_scope'
				});
			});
			clearInterval(gapiInt);
		}
	}

	//if node is not logged, logout from php
	socket_request('login', {}).then( function(res, err){
		if (err) return console.log(err);
		if (res.session === false){
			$.post("back_login.php", {
				action: "UNSET"
			}).done( function(data){
				data = JSON.parse(data);
				if (data.status == "LOGOUT")
					window.location.reload();
			});
		}
	});
}

function googleLogin(){
	var loginAjax = $.Deferred();
    auth2.signIn().then( function() {
        var id_token = auth2.currentUser.get().getAuthResponse().id_token;
		//console.log(id_token);
        $.post( "back_login.php", {
            action: "SET",
            token: id_token
        } ).done( function(data){
            //console.log(data);
            loginAjax.resolve(JSON.parse(data));
		});
		
		if (socket){
			socket_request('login', {
				token: id_token
			}).then( function(res, err){
				if (err) return console.log(err);
			})
		}

	}).catch( function(error){
		//console.log(error);
	});

    return loginAjax.promise();
}

async function googleLogout() {

	//logout on google api
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.disconnect();
	auth2.signOut().then(function () {
	});

	//unset php session
	await $.post( "back_login.php", {
		action: "UNSET",
	} ).done(function(data){
	});

	//destroy node session
	if (socket){
		await socket_request('login', {
			logout: true
		}).then( function(res, err){
			if (err) return console.log(err);
		})
	}

	return true;
}