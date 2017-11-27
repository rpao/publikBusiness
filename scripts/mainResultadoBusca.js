/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

var nomeEmpresa;

// Initializes mainPesquisas.
function mainPesquisas() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  
  this.filtroSpan = document.getElementById('filtros');
  
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');
  
  this.displayFiltros();
  
  this.initFirebase();
}

// Enables or disables the submit button depending on the values of the input
// fields.
mainPesquisas.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
mainPesquisas.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
mainPesquisas.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = mainPesquisas.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Signs-in Friendly Chat.
mainPesquisas.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
mainPesquisas.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
mainPesquisas.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Show user's profile and sign-out button.
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadPesquisas();
	
    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
mainPesquisas.prototype.checkSignedInWithMessage = function() {
  // Return true if the user is signed in Firebase
  if (this.auth.currentUser) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Requests permissions to show notifications.
mainPesquisas.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Enables or disables the submit button depending on the values of the input
// fields.
mainPesquisas.prototype.toggleButton = function() {
  if (this.messageInput.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Checks that the Firebase SDK has been correctly setup and configured.
mainPesquisas.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.mainPesquisas = new mainPesquisas();
};

// Saves the messaging device token to the datastore.
mainPesquisas.prototype.saveMessagingDeviceToken = function() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
          .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
};

// Saves a new message on the Firebase DB.
mainPesquisas.prototype.saveMessage = function(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (this.messageInput.value && this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;

    // Add a new message entry to the Firebase Database.
    this.messagesRef.push({
      empresa: currentUser.displayName,
	  escolhas: this.opcaoInput.value,
      pergunta: this.messageInput.value,
	  respostas:"",
	  usuarios:"",
	  status:"open",
	  dataCriacao:"01/11/2017"
    }).then(function() {
      // Clear message text field and SEND button state.
      this.toggleButton();
    }.bind(this)).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
  document.getElementById('pergunta').value=''; // Limpa o campo
  document.getElementById('opcoes').value=''; // Limpa o campo
};

// Loads chat messages history and listens for upcoming ones.
mainPesquisas.prototype.loadPesquisas = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('publik/pesquisas');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();
  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
	var nomeEmpresa = "Nike,Inc";
    var val = data.val();
  }.bind(this);
  
  this.messagesRef.on('child_added', setMessage);
  this.messagesRef.on('child_changed', setMessage);
};

// Displays a Message in the UI.
mainPesquisas.prototype.displayFiltros = function() {
	var filtros = "Faixa etária entre 0-10 anos, Muito Arborizado, Alto fluxo de Pessoas pela tarde.";
	
	var div = document.getElementById("listaFiltros");
	
	// If an element for that message does not exists yet we create it.
	if (!div) {
		var container = document.createElement('div');	
		container.innerHTML = '<div class="card-header bg-white">'+
		'	<div class="message-container">' +
		'	<div class="spacing"><div class="pic"></div></div>' +
		'	<form >'+
		'		<p class="filtro lead"></p>'+
		'	</form>'+
		'</div>';

		div = container.firstChild;
		div.setAttribute('id', key);
		this.filtroSpan.appendChild(div);
	}

	div.querySelector('.filtro').textContent = "Locais com: "+filtros;

	// Show the card fading-in and scroll to view the new message.
	setTimeout(function() {div.classList.add('visible')}, 1);

	this.filtroSpan.scrollTop = this.filtroSpan.scrollHeight;
};