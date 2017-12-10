function search(vector1,vector2,vector3)
{
	var i, j, k, flag;
	var answer = []; //contem todas as pracas que atendem os filtros
	var controle = [0,0,0]; //contador pras pracas
	var rst = 0;
	var data = { //banco com as informacoes
	"publik":{
		"locais": [
			 {
				"nome": "Praça Pinto Damásio (Praça da Várzea)",
				"avaliacao": "4.1",
				"endereco": "Av Afonso Olindense, SN - Várzea, Recife - PE, 50741-040",
				"historia": "Foi elaborada pelo consagrado paisagista brasileiro Roberto Burle Marx, falecido em 1994.Em 1936, Burle Marx concebeu um projeto de ajardinamento para a praça que previa um playground, um coreto, um lago central com fonte e um caramanchão que permitiria o sombreamento da área. Nos jardins, o paisagista programou a colocação de mangueiras, ficus-beijamina, oiti-da-praia e palmeira-real – substituídas pelas palmeiras-imperiais que estão até hoje por lá.",
				"latitude":"-8.0491137",
				"longitude":"-34.9594562",
				"taxas":{
					"faixaEtaria":{
						"id0":"5",
						"id1":"30",
						"id2":"50",
						"id3":"10",
						"id4":"3",
						"id5":"2"
					},
					"classeSocial":{
						"A":"2",
						"B":"30",
						"C":"50",
						"D":"10",
						"E":"8"
					},
					"nivelSats":"50",
					"mediaMensal":"15",
					"taxa_cres_mensal":"6.43",
					"taxa_retensao":"69",
					"plataforma":{
						"android":"52.4",
						"ios":"31.2",
						"outros":"16.1"
					},
					"freq":{
						"manha":"20",
						"tarde":"25",
						"noite":"35"
					}
				},
				"caracteristicas":["poucoArb","brinquedos","esportes"]
            },
            {
                "nome": "Praça de Casa Forte",
				"avaliacao": "4.5",
				"endereco": "Praça de Casa Forte - Casa Forte, Recife - PE, 52061-420",
				"historia": "Primeiro jardim público idealizado por Roberto Burle Marx, em 1934, o logradouro tem este nome em alusão ao Engenho da Casa Forte, que também deu nome ao bairro, onde ocorreu o Combate de Casa Forte, entre pernambucanos e holandeses, em 1645. No ano de 1933, o pátio em frente à Igreja foi revitalizado. Quatro anos depois, em 1937, o Prefeito Novaes Filho transforma esse logradouro em um espaço de lazer, colocando-o à disposição da população pernambucana",
				"latitude":"-8.0348372",
				"longitude":"-34.9194450",
				"taxas":{
                    "faixaEtaria":{
						"id0":"10",
						"id1":"30",
						"id2":"40",
						"id3":"10",
						"id4":"8",
						"id5":"2"
					},
					"classeSocial":{
						"A":"10",
						"B":"35",
						"C":"40",
						"D":"10",
						"E":"5"
					},
					"nivelSats":"74",
					"mediaMensal":"33",
					"taxa_cres_mensal":"3.34",
					"taxa_retensao":"42",
					"plataforma":{
						"android":"45.4",
						"ios":"34.5",
						"outros":"20.1"
					},
					"freq":{
						"manha":"20",
						"tarde":"35",
						"noite":"30"
					}
                },
				"caracteristicas":["carros"]
            },
            {
                "nome": "Praça do Derby",
				"avaliacao": "3.9",
				"endereco": "Praça do Derby - Centro, Recife - PE, 52010-140",
				"historia": "Foi projetada e construída em 1925 em frente ao que antes foi o hotel de Delmiro Gouveia e fazia parte do projeto recreativo deste.Teve sua construção executada no governo de Sérgio Loreto, tendo como prefeito o engenheiro Antônio de Góis. O projeto antecedeu o que foi denominado Paisagismo Moderno, lançando bases para o paisagismo depois projetado e executado pelo arquiteto Burle Marx.",
				"latitude":"-8.056698",
				"longitude":"-34.899324",
				"taxas":{
                    "faixaEtaria":{
						"id0":"10",
						"id1":"25",
						"id2":"30",
						"id3":"25",
						"id4":"11",
						"id5":"4"
					},
					"classeSocial":{
						"A":"5",
						"B":"30",
						"C":"30",
						"D":"25",
						"E":"10"
					},
					"nivelSats":"53",
					"mediaMensal":"44",
					"taxa_cres_mensal":"7.21",
					"taxa_retensao":"54",
					"plataforma":{
						"android":"50.2",
						"ios":"32.4",
						"outros":"18.4"
					},
					"freq":{
						"manha":"43",
						"tarde":"23",
						"noite":"30"
					}
                },
				"caracteristicas":["centro","carros","brinquedos"]
            }
		]
	}
};

	for(i = 0;i < data.publik.locais.length;i++)//loop busca se os valores buscados sao maiores que a media mensal pra aquela praca
	{
	
		for(j = 0;j < vector1.length;j++)
		{
			switch(vector1[j])
			{
				case 0:
					if(data.publik.locais[i].taxas.faixaEtaria.id0 >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				case 1:
					if(data.publik.locais[i].taxas.faixaEtaria.id1 >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				case 2:
					if(data.publik.locais[i].taxas.faixaEtaria.id2 >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				case 3:
					if(data.publik.locais[i].taxas.faixaEtaria.id3 >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				case 4:
					if(data.publik.locais[i].taxas.faixaEtaria.id4 >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				default:
					if(data.publik.locais[i].taxas.faixaEtaria.id5 >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
			}
		}
		for(j = 0;j < vector2.length;j++)
		{
			switch(vector2[j])
			{
				case 0:
					if(data.publik.locais[i].taxas.freq.manha >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				case 1:
					if(data.publik.locais[i].taxas.freq.tarde >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
				    break;
				default:
					if(data.publik.locais[i].taxas.freq.noite >= data.publik.locais[i].taxas.mediaMensal)
					{
						answer.push(data.publik.locais[i].nome);
					}
			}
		}
		for(j = 0;j < vector3.length;j++)
		{
			switch(vector3[j])
			{
				case 0:
					for(k = 0;k < data.publik.locais[i].caracteristicas.length;k++)
					{
						if(data.publik.locais[i].caracteristicas[k] == "poucoArb")
						{
							answer.push(data.publik.locais[i].nome);
						}
					}
				    break;
				case 1:
					for(k = 0;k < data.publik.locais[i].caracteristicas.length;k++)
					{
						if(data.publik.locais[i].caracteristicas[k] == "centro")
						{
							answer.push(data.publik.locais[i].nome);
						}
					}
				    break;
				case 2:
					for(k = 0;k < data.publik.locais[i].caracteristicas.length;k++)
					{
						if(data.publik.locais[i].caracteristicas[k] == "carros")
						{
							answer.push(data.publik.locais[i].nome);
						}
					}
				    break;
				case 3:
					for(k = 0;k < data.publik.locais[i].caracteristicas.length;k++)
					{
						if(data.publik.locais[i].caracteristicas[k] == "brinquedos")
						{
							answer.push(data.publik.locais[i].nome);
						}
					}
				    break;
				default:
					for(k = 0;k < data.publik.locais[i].caracteristicas.length;k++)
					{
						if(data.publik.locais[i].caracteristicas[k] == "esportes")
						{
							answer.push(data.publik.locais[i].nome);
						}
					}
			}
		}
	}
	for(i = 0;i < answer.length;i++)//apos ter todas as pracas no vetor answer checa pra saber quantas vezes elas atenderam aos filtros
	{
		if(answer[i] == "Praça Pinto Damásio (Praça da Várzea)")
		{
			controle[0]++;
		}
		else if(answer[i] == "Praça de Casa Forte")
		{
			controle[1]++;
		}
		else if(answer[i] == "Praça do Derby")
		{
			controle[2]++;
		}
	}
	if(controle[0] >= controle[1] && controle[0] >= controle[2])//a que possuir maior numero de filtros atendidos eh retornada
	{
		rst = 1;
	}
	else if(controle[1] > controle[0] && controle[1] >= controle[2])
	{
		rst = 2;
	}
	else
	{
		rst = 3;
	}
	
	return rst;
}