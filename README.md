# publik

Para executar:
1. instalar npm: 
	https://nodejs.org/en/

2. instalar firebase:
	npm -g install firebase-tools

ainda nao utiliza {
	3. instalar bower:
		npm install -g bower
		
	4. instalar chartist:
		bower install chartist --save
}

5. Criar projeto no firebase (como o servidor ainda é local, tem que ser feito assim) e
   configurar seguindo o passo 3 desse tutorial (https://codelabs.developers.google.com/codelabs/firebase-web/#2)
   OBS: por enquanto é necessário fazer login no google para acessar a base de dados.
   
   configurar regras da base de dados:
{
	"rules": {
		".read": "true",
		".write": "true",
		"tasks": {
		".indexOn": ["done"]
		}
	}
}
   

6. Importar manualmente o .json "dados_ficticios.json" (está na pasta do projeto clonado do git) para o database
   (https://support.google.com/firebase/answer/6386780?hl=en)

7. login no firebase:
	firebase login
	
6. escolhendo projeto:
	firebase use --add
	- escolher o projeto que foi criado em 5
	
7. executar o projeto:
	firebase serve
	
8. acesso em http://localhost:5000
	


