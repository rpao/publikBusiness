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

// Loads chat messages history and listens for upcoming ones.
mainDetalhes.prototype.loadEmpresas = function() {
  // Reference to the /messages/ database path.
  this.messagesRef = this.database.ref('publik/empresa');
  this.adocaoRef = this.database.ref('publik/locais');
  
  // Make sure we remove all previous listeners.
  this.messagesRef.off();
  this.adocaoRef.off();
  
  // Loads the last 12 messages and listen for new ones.
  var setMessage = function(data) {
	if (data.key == KEY){
		this.displayEmpresa(data.val());
	}
  }.bind(this);
  
  this.messagesRef.on('child_added', setMessage);
  this.messagesRef.on('child_changed', setMessage);
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
	
	txt_Nome.textContent = nome;
	txt_Endereco.textContent = endereco;		
	txt_Avaliacao.textContent = avaliacao;		
	txt_Historia.textContent = historia;
	
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

mainDetalhes.prototype.nivelSatisChart = function(nivel){
	
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

mainDetalhes.prototype.plataformaChart = function(android, ios, outros){
	
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

mainDetalhes.prototype.freqMensalChart = function(jan, fev, mar, abr, mai, jun, jul, ago, set, out, nov, dez){
	
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

mainDetalhes.prototype.freqDiariaChart = function(dia1,dia2,dia3,dia4,dia5,dia6,dia7,dia8,dia9,dia10,dia11,dia12,dia13,dia14,dia15,dia16,dia17,dia18,dia19,dia20,dia21,dia22,dia23,dia24,dia25,dia26,dia27,dia28,dia29,dia30,dia31){
	
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

mainDetalhes.prototype.novosUsersChart = function(mediaMensal){
	
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
