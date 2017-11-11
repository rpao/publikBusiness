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
FriendlyChat.prototype.loadMessages = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('publik/locais');
  // Make sure we remove all previous listeners.
  this.messagesRef.off();

  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
    this.displayMessage(data.key, val.nome, val.endereco, val.avaliacao, val.historia, val.taxas);  
  }.bind(this);
  
  this.messagesRef.limitToLast(12).on('child_added', setMessage);
  this.messagesRef.limitToLast(12).on('child_changed', setMessage);
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
    // Show user's profile and sign-out button.
    this.signOutButton.removeAttribute('hidden');

    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

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

// Displays a Message in the UI.
FriendlyChat.prototype.displayMessage = function(key, nome, endereco, avaliacao, historia, taxa) {  
  var txtNome = document.getElementById("nome");
  txtNome.textContent = nome;
  
  var txtEnd = document.getElementById("endereco");
  txtEnd.textContent = endereco;
  
  var txtAv = document.getElementById("avaliacao");
  txtAv.textContent = "Avaliação: "+avaliacao;
  
  var txtHistoria = document.getElementById("historia");
  txtHistoria.textContent = historia;

  this.nivelSatisChart(taxa.nivelSats);
  this.classeSocialChart(taxa.classeSocial.A, taxa.classeSocial.B, taxa.classeSocial.C, taxa.classeSocial.D, taxa.classeSocial.E);
  this.faixaEtariaChart(taxa.faixaEtaria.id0,taxa.faixaEtaria.id1,taxa.faixaEtaria.id2,taxa.faixaEtaria.id3,taxa.faixaEtaria.id4,taxa.faixaEtaria.id5);
  this.plataformaChart(taxa.plataforma.ios, taxa.plataforma.android, taxa.plataforma.outros);
  this.freqMensalChart(taxa.freq_mensal.jan, taxa.freq_mensal.fev, taxa.freq_mensal.mar, taxa.freq_mensal.abr, taxa.freq_mensal.mai, taxa.freq_mensal.jun, taxa.freq_mensal.jul, taxa.freq_mensal.ago, taxa.freq_mensal.set, taxa.freq_mensal.out, taxa.freq_mensal.nov, taxa.freq_mensal.dez);
  this.freqDiariaChart(taxa.freq_diaria.dia1,taxa.freq_diaria.dia2,taxa.freq_diaria.dia3,taxa.freq_diaria.dia4,taxa.freq_diaria.dia5,taxa.freq_diaria.dia6,taxa.freq_diaria.dia7,taxa.freq_diaria.dia8,taxa.freq_diaria.dia9,taxa.freq_diaria.dia10,taxa.freq_diaria.dia11,taxa.freq_diaria.dia12,taxa.freq_diaria.dia13,taxa.freq_diaria.dia14,taxa.freq_diaria.dia15,taxa.freq_diaria.dia16,taxa.freq_diaria.dia17,taxa.freq_diaria.dia18,taxa.freq_diaria.dia19,taxa.freq_diaria.dia20,taxa.freq_diaria.dia21,taxa.freq_diaria.dia22,taxa.freq_diaria.dia23,taxa.freq_diaria.dia24,taxa.freq_diaria.dia25,taxa.freq_diaria.dia26,taxa.freq_diaria.dia27,taxa.freq_diaria.dia28,taxa.freq_diaria.dia29,taxa.freq_diaria.dia30,taxa.freq_diaria.dia31);
  
  
  var txtTCM = document.getElementById("taxa_cres_mensal");
  txtTCM.textContent = taxa.taxa_cres_mensal;
  
  var txtTR = document.getElementById("taxa_retensao");
  txtTR.textContent = taxa.taxa_retensao;
   
  this.novosUsersChart(taxa.mediaMensal);
};

FriendlyChat.prototype.nivelSatisChart = function(nivel){
	new Chartist.Bar('#chartSatisfacao', {
	  series: [[nivel]]
	}, {
	  axisX: {
		// On the x-axis start means top and end means bottom
		position: 'start'
	  },
	  axisY: {
		// On the y-axis start means left and end means right
		position: 'end'
	  }
	});
};

FriendlyChat.prototype.classeSocialChart = function(a,b,c,d,e){
	var labels = ['A', 'B', 'C', 'D', 'E'];
	
	var data = {
	  series: [a,b,c,d,e]
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
		labelDirection: 'explode',
		labelInterpolationFnc: function(value, idx) {
		  return labels[idx]+" ("+value+"%)";
		}
	  }],
	  ['screen and (min-width: 1024px)', {
		labelOffset: 80,
		chartPadding: 20
	  }]
	];

	new Chartist.Pie('#chartClasseSocial', data, options, responsiveOptions);
};

FriendlyChat.prototype.faixaEtariaChart = function(a,b,c,d,e,f){
	var labels = ['0 a 9', '10 a 19', '20 a 29', '30 a 39', '40 a 49', 'a partir de 50'];
	
	var data = {
	  series: [a,b,c,d,e,f]
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
		labelDirection: 'explode',
		labelInterpolationFnc: function(value, idx) {
		  return labels[idx]+" ("+value+"%)";
		}
	  }],
	  ['screen and (min-width: 1024px)', {
		labelOffset: 80,
		chartPadding: 20
	  }]
	];

	new Chartist.Pie('#chartFaixaEtaria', data, options, responsiveOptions);
};

FriendlyChat.prototype.plataformaChart = function(android, ios, outros){
	var labels = ['Android', 'IOs', 'Outros'];
	
	var data = {
	  series: [android, ios, outros]
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
		labelDirection: 'explode',
		labelInterpolationFnc: function(value, idx) {
		  return labels[idx]+" ("+value+"%)";
		}
	  }],
	  ['screen and (min-width: 1024px)', {
		labelOffset: 80,
		chartPadding: 20
	  }]
	];

	new Chartist.Pie('#chartPlataformas', data, options, responsiveOptions);
};

FriendlyChat.prototype.freqMensalChart = function(jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez){
	var data = {
	  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	  series: [[jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez]]
	};
	
	var options = {};
	
	var responsiveOptions = [
	  ['screen and (max-width: 640px)', {
		seriesBarDistance: 5,
		axisX: {
		  labelInterpolationFnc: function (value) {
			return value[0];
		  }
		}
	  }]
	];

	new Chartist.Bar('#chartFreqMensal', data, options, responsiveOptions);
};

FriendlyChat.prototype.freqDiariaChart = function(dia1,dia2,dia3,dia4,dia5,dia6,dia7,dia8,dia9,dia10,dia11,dia12,dia13,dia14,dia15,dia16,dia17,dia18,dia19,dia20,dia21,dia22,dia23,dia24,dia25,dia26,dia27,dia28,dia29,dia30,dia31){
	var data = {
	  labels: ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"],
	  series: [[dia1,dia2,dia3,dia4,dia5,dia6,dia7,dia8,dia9,dia10,dia11,dia12,dia13,dia14,dia15,dia16,dia17,dia18,dia19,dia20,dia21,dia22,dia23,dia24,dia25,dia26,dia27,dia28,dia29,dia30,dia31]]
	};
	
		
	var options = {};
	
	var responsiveOptions = [
	  ['screen and (max-width: 640px)', {
		seriesBarDistance: 5,
		axisX: {
		  labelInterpolationFnc: function (value) {
			return value[0];
		  }
		}
	  }]
	];

	new Chartist.Bar('#chartFreqDiaria', data, options, responsiveOptions);
};

FriendlyChat.prototype.novosUsersChart = function(mediaMensal){
	new Chartist.Pie(
		'#chartNovosUsuariosMensal', 
		{
			series: [mediaMensal]
		},
		{
		  donut: true,
		  donutWidth: 60,
		  startAngle: 270,
		  total: 200,
		  showLabel: true
		}
	);
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
