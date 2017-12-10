/**
***  Main Painel - Utilizada por painel.html
**/
'use strict';

//Gets Empresa and local's ids from URL
var url = location.href;
var query = url.split("?");
query = query[1].split("&");
query[0] = query[0].split("=");
query[1] = query[1].split("=");

var KEY = query[0][1];   // id da empresa
var LOCAL = query[1][1]; // id do local

window.onload = function() {
  window.mainDetalhes = new mainDetalhes();
};

// Initializes mainDetalhes.
function mainDetalhes() {
  this.checkSetup();  
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
mainDetalhes.prototype.initFirebase = function() {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
mainDetalhes.prototype.onAuthStateChanged = function(user) {
  this.loadLocais(); // acessa o BD
};

// Checks that the Firebase SDK has been correctly setup and configured.
mainDetalhes.prototype.checkSetup = function() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
};

mainDetalhes.prototype.loadLocais = function() {
  // Reference to the /locais/ database path.
  this.messagesRef = this.database.ref('publik/locais');
  
  // Make sure we remove all previous listeners.
  this.messagesRef.off();
  
  // get data and display it
  var setMessage = function(data) {
	var val = data.val();
	if (data.key == LOCAL){
		this.displayLocal(val.nome, val.endereco, val.avaliacao, val.historia, val.taxas);
	}
  }.bind(this);
  
  this.messagesRef.on('child_added', setMessage);
  this.messagesRef.on('child_changed', setMessage);
};

// Displays a data in the UI.
mainDetalhes.prototype.displayLocal = function(nome, endereco, avaliacao, historia, taxa) {	
	var txt_Nome = document.getElementById("nome");
	var txt_Endereco = document.getElementById("endereco");
	var txt_Avaliacao = document.getElementById("avaliacao");
	var txt_Historia = document.getElementById("historia");
	var txt_NivelSats = document.getElementById("nivel_satisfacao");
	var txt_User_med = document.getElementById("user_med_mensal");
	var txtTCM = document.getElementById("taxa_cres_mensal");
	var txtTR = document.getElementById("taxa_retensao");
	
	txt_Nome.textContent = nome;
	txt_Endereco.textContent = endereco;		
	txt_Avaliacao.textContent = avaliacao;		
	txt_Historia.textContent = historia;
	txt_NivelSats.textContent = taxa.nivelSats+"%";
	txt_User_med.textContent = taxa.mediaMensal;
	txtTCM.textContent = taxa.taxa_cres_mensal+"%";
	txtTR.textContent = taxa.taxa_retensao+"%";

	this.classeSocialChart(taxa.classeSocial.A, taxa.classeSocial.B, taxa.classeSocial.C, taxa.classeSocial.D, taxa.classeSocial.E);
	this.faixaEtariaChart(taxa.faixaEtaria.id0,taxa.faixaEtaria.id1,taxa.faixaEtaria.id2,taxa.faixaEtaria.id3,taxa.faixaEtaria.id4,taxa.faixaEtaria.id5);
	this.freqChart(taxa.freq.manha, taxa.freq.tarde, taxa.freq.noite);
};

mainDetalhes.prototype.classeSocialChart = function(a,b,c,d,e){
	
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

mainDetalhes.prototype.faixaEtariaChart = function(a,b,c,d,e,f){
	
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

mainDetalhes.prototype.freqChart = function(manha, tarde, noite){
	
	var data = {
	  labels: ['Manhã', 'Tarde', 'Noite'],
	  series: [[manha, tarde, noite]]
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