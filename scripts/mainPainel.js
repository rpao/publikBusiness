/**
***  Main Painel - Utilizada por painel.html
**/
'use strict';

var lista_adocoes = [];

// Gets ID from URL
var url = location.href;
var query = url.split("=");
var KEY = query[1];
	
window.onload = function() {
  window.mainPainel = new mainPainel();
};

// Initializes mainPainel.
function mainPainel() {
  this.checkSetup();
  
  //filler de adoçoes
  this.adocoesList = document.getElementById('adocoes');
  
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
mainPainel.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
mainPainel.prototype.onAuthStateChanged = function(user) {
  this.loadEmpresas(); // acessa o BD
};

// Checks that the Firebase SDK has been correctly setup and configured.
mainPainel.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

// Loads empresas and listens for upcoming ones.
mainPainel.prototype.loadEmpresas = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('publik/empresa');
  this.adocaoRef = this.database.ref('publik/locais');
  
  // Make sure we remove all previous listeners.
  this.messagesRef.off();
  this.adocaoRef.off();
  
  // get data and display it
  var setMessage = function(data) {
	if (data.key == KEY){
		this.displayEmpresa(data.val());
	}
  }.bind(this);
  
  this.messagesRef.on('child_added', setMessage);
  this.messagesRef.on('child_changed', setMessage);
};

// Displays a data in the UI.
mainPainel.prototype.displayEmpresa = function(dados) {	
	var txt_emp_Nome = document.getElementById("emp_nome");
	var txt_emp_Cnpj = document.getElementById("emp_cnpj");
	var txt_emp_Endereco = document.getElementById("emp_endereco");
	var txt_emp_Fone = document.getElementById("emp_telefone");
	
	var txt_resp_nome = document.getElementById("resp_nome");
	var txt_resp_cargo = document.getElementById("resp_cargo");
	var txt_resp_cpf = document.getElementById("resp_cpf");
	var txt_resp_email = document.getElementById("resp_email");
	var txt_resp_telefone = document.getElementById("resp_telefone");
	
	var txt_status_cad = document.getElementById("status_cad");
	var txt_data_cad = document.getElementById("data_cad");
	
	txt_emp_Nome.textContent = dados.empresa;
	txt_emp_Cnpj.textContent = dados.cnpj;		
	txt_emp_Endereco.textContent = dados.endereco;		
	txt_emp_Fone.textContent = dados.telefone;
	
	txt_resp_nome.textContent = dados.responsavel;
	txt_resp_cargo.textContent = dados.cargo;
	txt_resp_cpf.textContent = dados.cpf;
	txt_resp_email.textContent = dados.email;
	txt_resp_telefone.textContent = dados.telefoneResponsavel;
	
	txt_status_cad.textContent = dados.tipoCadastro+" ("+dados.status+")";
	txt_data_cad.textContent = dados.dataCadastro;
		
	lista_adocoes = dados.locais_adotados;
	if (lista_adocoes != null){
		lista_adocoes = lista_adocoes.split(";");
		for (var i = 0; i < lista_adocoes.length-1; i++){
			lista_adocoes[i] = lista_adocoes[i].split("|");
		}
	
		for (var i = 0; i < lista_adocoes.length-1; i++){
			this.displayAdocoes(lista_adocoes[i][0],lista_adocoes[i][1],lista_adocoes[i][2]);
		}
	}
};

mainPainel.prototype.displayAdocoes = function(keylocal, nome, endereco) {   	
	var div = document.getElementById(keylocal);
	
	// If an element for that adoption does not exists yet we create it.
	if (!div) {
		var container = document.createElement('div');	
		
		container.innerHTML = '<div class="col-md-12">'+
		'  <table class="table">'+
		'    <div class="card-header bg-light text-dark">'+
		'		<a class="navbar-brand text-secondary" href="detalhesLocal.html?e='+KEY+'&l='+keylocal+'"><i class="fa d-inline fa-lg fa-map-marker"></i><b class="nome_local"></b></a>'+
		'    </div>'+
		'    <tbody>'+
		'      <tr>'+
		'        <td class="endereco_local text-muted"></td>'+
		'      </tr>'+
		'    </tbody>'+
		'  </table>'+
		'</div>';
		
		div = container.firstChild;
		div.setAttribute('id', keylocal);
		this.adocoesList.appendChild(div);
	}

	div.querySelector('.nome_local').textContent = nome;
	
	var endLocal_element = div.querySelector('.endereco_local');
	endLocal_element.textContent = endereco;

	// Show the card fading-in and scroll to view the new message.
	setTimeout(function() {div.classList.add('visible')}, 1);

	this.adocoesList.scrollTop = this.adocoesList.scrollHeight;
};