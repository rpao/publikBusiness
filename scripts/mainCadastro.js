/**
***  Main Cadastro - Utilizada por cadastro.html
***  Acessa o banco de dados e verifica se a empresa que está solicitando uma key já está cadastradas
***  caso nao, efetua o cadastro na base de dados como uma empresa que está solicitando uma key.
**/
'use strict';

var listaLocais = [];
var listaNomesL = [];
var listaEmpresas = [];

var url = location.href;
var query = url.split("=");
var localID = query[1];
	
window.onload = function() {
  window.mainCadastro = new mainCadastro();
};

// Initializes mainCadastro.
function mainCadastro() {
  this.checkSetup();
  
  // Elementos do html - inputs do cadastro
  this.messageForm = document.getElementById('cadastro-form');
  this.nomeEmpresa = document.getElementById('nomeEmpresa');
  this.cepEmpresa = document.getElementById('cepEmpresa');
  this.ruaEmpresa = document.getElementById('ruaEmpresa');
  this.numEmpresa = document.getElementById('numEmpresa');
  this.cnpjEmpresa = document.getElementById('cnpjEmpresa');
  this.telefoneEmpresa = document.getElementById('telefoneEmpresa');
  
  this.nomeResponsavel = document.getElementById('nomeResponsavel');
  this.telefone_responsavel = document.getElementById('telefoneResponsavel');
  this.cpfResponsavel = document.getElementById('cpfResponsavel');
  this.cargoResponsavel = document.getElementById('cargoResponsavel');
  this.emailResponsavel = document.getElementById('emailResponsavel');
  this.conf_emailResponsavel = document.getElementById('repetir_email');
  
  this.data_Contato = document.getElementById('data');
  this.hora_Contato = document.getElementById('hora');
  this.local_Contato = document.getElementById('local');
  
  // botao de cadastrar
  this.submitButton = document.getElementById('submit');
  
  // Saves message on form submit.
  this.messageForm.addEventListener('submit', this.saveMessage.bind(this));
  
  // Toggle for the button.
  var buttonTogglingHandler = this.toggleButton.bind(this);
  this.nomeEmpresa.addEventListener('keyup', buttonTogglingHandler);
  this.nomeEmpresa.addEventListener('change', buttonTogglingHandler);

  this.initFirebase();
}

// Enables or disables the submit button depending on the values of the input
// fields.
mainCadastro.prototype.toggleButton = function() {
  if (this.nomeEmpresa.value) {
    this.submitButton.removeAttribute('disabled');
  } else {
    this.submitButton.setAttribute('disabled', 'true');
  }
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
mainCadastro.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
mainCadastro.prototype.onAuthStateChanged = function(user) {
  this.loadLocais(); // acessa o BD
};

// Checks that the Firebase SDK has been correctly setup and configured.
mainCadastro.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

// Saves a new message on the Firebase DB.
mainCadastro.prototype.saveMessage = function(e) {
  e.preventDefault();
  
  var index = listaLocais.indexOf(localID);
  if (index == -1){
	  alert("Ocorreu um erro... Redirecionando");
  }
  else{
	  // Check that the user entered a message and is signed in.
	  if (this.nomeEmpresa.value){
		var currentUser = this.auth.currentUser;

		// Add a new message entry to the Firebase Database.
		this.empresaRef.push({
		  cnpj:this.cnpjEmpresa.value,
		  empresa: this.nomeEmpresa.value,
		  endereco: this.ruaEmpresa.value+","+this.numEmpresa.value+"-"+this.cepEmpresa.value,
		  telefone: this.telefoneEmpresa.value,
		  responsavel: this.nomeResponsavel.value,
		  cpf: this.cpfResponsavel.value,
		  cargo: this.cargoResponsavel.value,
		  telefoneResponsavel: this.telefone_responsavel.value,
		  email: this.emailResponsavel.value,
		  dataHoraContato: this.data_Contato.value+";"+this.hora_Contato.value,
		  localContato:this.local_Contato.value,
		  localSolicitado: localID,
		  tipoCadastro:"Adocao",
		  status:"em processamento",
		  dataCadastro:"01/11/2017"
		}).then(function() {
		  // Clear message text field and SEND button state.
		  this.toggleButton();
		}.bind(this)).catch(function(error) {
		  console.error('Error writing new message to Firebase Database', error);
		});
	  }
	// Reseta todos os inputs
	document.getElementById('cadastro-form').value = '';
	document.getElementById('nomeEmpresa').value = '';
	document.getElementById('cepEmpresa').value = '';
	document.getElementById('ruaEmpresa').value = '';
	document.getElementById('numEmpresa').value = '';
	document.getElementById('cnpjEmpresa').value = '';
	document.getElementById('telefoneEmpresa').value = '';

	document.getElementById('nomeResponsavel').value = '';
	document.getElementById('telefoneResponsavel').value = '';
	document.getElementById('cpfResponsavel').value = '';
	document.getElementById('cargoResponsavel').value = '';
	document.getElementById('emailResponsavel').value = '';
	document.getElementById('repetir_email').value = '';

	document.getElementById('data').value = '';
	document.getElementById('hora').value = '';
	document.getElementById('local').value = '';
	
	alert("Cadastro efetuado, entraremos em contato em breve.");
  }
  window.location.href = "/";
};

// Loads chat messages history and listens for upcoming ones.
mainCadastro.prototype.loadLocais = function() {
  // Reference to the /messages/ database path.
  this.empresaRef = this.database.ref('publik/empresa');
  this.messagesRef = this.database.ref('publik/locais');
  // Make sure we remove all previous listeners.
  this.empresaRef.off();
  this.messagesRef.off();
  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
    var val = data.val();
	listaLocais[listaLocais.length] = data.key;
	listaNomesL[listaNomesL.length] = val.nome;
	listaEmpresas[listaEmpresas.length] = val.empresa_adotante;
  }.bind(this);
  
  this.messagesRef.on('child_added', setMessage);
  this.messagesRef.on('child_changed', setMessage);
};