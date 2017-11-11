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

var param1var = getQueryVariable("id");
var idPesquisa;
var idUsuarios = [];
var feUsuarios = [];

var porcentagemFE = [0,0,0,0,0,0];

function getQueryVariable(variable) {
  var query = window.location.search.substring(1);  
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable && pair[1] != null) {
	    idPesquisa = pair[1];
    }else{
		//alert('Erro: Dado solicitado nao foi encontrado');
		location.assign("pesquisas.html");
	}
  } 
}

// Initializes FriendlyChat.
function FriendlyChat() {
  this.checkSetup();

  // Shortcuts to DOM Elements.
  this.messageList = document.getElementById('messages');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  // Saves message on form submit.
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));
  
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.signInSnackbar = document.getElementById('must-signin-snackbar');

  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
FriendlyChat.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadPesquisas = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('publik/pesquisas');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();
  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {	
	
	if (data.key == idPesquisa){
		var val = data.val();
		this.displayPesquisas(data.key, val.escolhas, val.pergunta, val.respostas, val.status, val.dataCriacao, val.usuarios);
	}
	
  }.bind(this);

  this.messagesRef.on('child_added', setMessage);
  this.messagesRef.on('child_changed', setMessage);

};

// Loads chat messages history and listens for upcoming ones.
FriendlyChat.prototype.loadUsuarios = function() {
  // Reference to the /messages/ database path.
  this.usuariosRef = this.database.ref('publik/usuarios');
  // Make sure we remove all previous listeners.
  this.usuariosRef.off();
  
  var setUsuario = function(data) {
    var val = data.val();
	idUsuarios[idUsuarios.length] = data.key;
	feUsuarios[feUsuarios.length] = val.faixaEtaria;	
  }.bind(this);
  
  this.usuariosRef.on('child_added', setUsuario);
  this.usuariosRef.on('child_changed', setUsuario);
};

// Displays a Message in the UI.
FriendlyChat.prototype.displayPesquisas = function(key, escolhas, pergunta, respostas, status, dataCriacao, usuario) {
	var txtPergunta = document.getElementById("pergunta");
	txtPergunta.textContent = pergunta;
	
	var txtDt = document.getElementById("dataCriacao");
	txtDt.textContent = "Criado em "+dataCriacao;
	
	var txtStatus = document.getElementById("status");
	txtStatus.textContent = "Status: "+status;
  
	escolhas = escolhas.split(',');
	
	if (respostas == ""){
		respostas = null;
	}else{
		respostas = respostas.split(',');
	}
	
	if (usuario == ""){
		usuario = null;
	}else{
		usuario = usuario.split(',');
		for(var i = 0; i < idUsuarios.length; i++){
			var j = usuario.indexOf(idUsuarios[i]);
			if (j != -1){
				porcentagemFE[feUsuarios[j][2]] += 1;
			}
		}
	}
	
	if (respostas != null){
		this.contEscolhas(escolhas, respostas);
	}	
	
	if (usuario != null){
		var labels = ['0-10','10-19','20-29','30-39','40-49','a partir de 50'];	
		this.chartResposta(porcentagemFE, labels, '#chartFaixaEtaria');
	}
};

FriendlyChat.prototype.contEscolhas = function(escolhas, respostas){
	// contar resposta com maior ocorrencia
	var cont = [];
	
	for (var i = 0; i < escolhas.length; i++){
		cont[i] = 0;
		for (var j = 0; j < respostas.length; j++){
			if (escolhas[i] == respostas[j]){
				cont[i] += 1;
			}
		}
	}
	
	this.chartResposta(cont, escolhas, '#chartEscolhas');
}

FriendlyChat.prototype.chartResposta = function(dados, labels, chart){
	
	var qtd = 0
	for (var i = 0; i < dados.length; i++){
		qtd += dados[i];
	}
	
	for (var i = 0; i < dados.length; i++){
		dados[i] = dados[i]*100.0/qtd;
	}
	
	var data = {
	  series: dados
	};

	var options = {
	  labelInterpolationFnc: function(value) {
		return value[0];
	  }
	};

	var responsiveOptions = [
	  ['screen and (min-width: 640px)', {
		chartPadding: 30,
		labelOffset: 100,
		labelInterpolationFnc: function(value, idx) {
		  return labels[idx]+" ("+value+"%)";
		}
	  }],
	  ['screen and (min-width: 1024px)', {
		labelOffset: 80,
		chartPadding: 20
	  }]
	];

	new Chartist.Pie(chart, data, options, responsiveOptions);
};

// Sets the URL of the given img element with the URL of the image stored in Cloud Storage.
FriendlyChat.prototype.setImageUrl = function(imageUri, imgElement) {
  // If the image is a Cloud Storage URI we fetch the URL.
  if (imageUri.startsWith('gs://')) {
    imgElement.src = FriendlyChat.LOADING_IMAGE_URL; // Display a loading image first.
    this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
      imgElement.src = metadata.downloadURLs[0];
    });
  } else {
    imgElement.src = imageUri;
  }
};

// Signs-in Friendly Chat.
FriendlyChat.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out of Friendly Chat.
FriendlyChat.prototype.signOut = function() {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
FriendlyChat.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.	
	this.loadUsuarios();
	
	this.loadPesquisas();
	
    // We save the Firebase Messaging Device token and enable notifications.
    this.saveMessagingDeviceToken();
  } else { // User is signed out!
    this.signOutButton.setAttribute('hidden', 'true');

    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
FriendlyChat.prototype.checkSignedInWithMessage = function() {
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

// Saves the messaging device token to the datastore.
FriendlyChat.prototype.saveMessagingDeviceToken = function() {
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

// Requests permissions to show notifications.
FriendlyChat.prototype.requestNotificationsPermissions = function() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    this.saveMessagingDeviceToken();
  }.bind(this)).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
};

// Resets the given MaterialTextField.
FriendlyChat.resetMaterialTextfield = function(element) {
  element.value = '';
  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
};

// Checks that the Firebase SDK has been correctly setup and configured.
FriendlyChat.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

window.onload = function() {
  window.friendlyChat = new FriendlyChat();
};
