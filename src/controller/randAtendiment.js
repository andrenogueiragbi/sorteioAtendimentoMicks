const { connectionDB } = require('../database');
const select = require('../modal/select')
const { logsSreen } = require('./printLog')
var lodash = require('lodash');
const { valorfaixa } = require('./contar')
const { ordenar } = require('./ordenar')



const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = {
    async index(req, res) {

        debug = true

        /*ARRAY DAS FAIXA DE ATRAZO QUE A MICKS TRABALHA */
        var faixa30 = []
        var faixa60 = []
        var faixa90 = []
        var faixa120 = []

        resultadoFaixa30 = {
            resumo: [],
            reultado_divisao: []
        }

        resultadoFaixa60 = {
            resumo: [],
            reultado_divisao: []
        }

        resultadoFaixa90 = {
            resumo: [],
            reultado_divisao: []
        }

        resultadoFaixa120 = {
            resumo: [],
            reultado_divisao: []
        }




        /*BUSCANDO USUÁRIOS NO BANCO DE DADOS, ATIVOS E QUE PODE SORTEAR OS ATENDIMENTOS*/
        const [usuariosDB = results] = await connectionDB.query('select * from usuarios WHERE sortear= "S" AND ativo = "S"');
        var usuarios = usuariosDB
        var totalUsarios = usuarios.length

        /*SE NÃO TIVER USUARIOS ATIVOS/SORTEAR IRÁ VOLTAR ERRO */
        if (totalUsarios == 0) {
            return res.status(404).json({
                erro: true,
                message: 'não existe usuário para fazer sortear'
            })
        }


        /*BUSACANDO OS CLIENTES DEVEDORES*/
        const [datas = results] = await connectionDB.query(select.clienteDevedor);

        /*FAZENDO A SEPARAÇÃO POR FAIXA DE ATRAZO 30 60 90 120 */
        for (data of datas) {

            cliente = {
                valor: data.valor,
                cod_cli: data.cod_cli,
                faixa_atraso: data.faixa_atraso,
                nome_cli: data.nome_cli.trim(),
            }

            /*ADICIONANOD OS CLIENTES NAS SUAS FAIXAS DE ATRASOS*/
            if (data.faixa_atraso == 30) {

                faixa30.push(cliente)

            } else if (data.faixa_atraso == 60) {

                faixa60.push(cliente)

            } else if (data.faixa_atraso == 90) {

                faixa90.push(cliente)

            } else if (data.faixa_atraso == 120) {

                faixa120.push(cliente)

            } else {
                console.log("Invalid", cliente) //SE NÃO HAVER FAIXA DE ATRASOS =! DE 30/60/90/120
            }

        }

        /*ADICIONANDO O OBJETO DE FAIXA DE ATRASOS NO USUARIO*/
        for (index in usuarios) {
            usuarios[index].cobranca30 = []
            usuarios[index].cobranca60 = []
            usuarios[index].cobranca90 = []
            usuarios[index].cobranca120 = []
        }

        /*ORDENANDO POR VALOR
        OBS: USANDO UMA BIBLIOTECA DE TERCEIRO
        */
        faixa30 = ordenar(faixa30, 'valor')
        faixa60 = ordenar(faixa60, 'valor')
        faixa90 = ordenar(faixa90, 'valor')
        faixa120 = ordenar(faixa120, 'valor')

        if (faixa30.length > 0) {

            /*SORTEANDO FAIXA DE 30 DIAS DE VENCIDOS */
            i = 0
            for (cliente of faixa30) {

                /*ADCIONANDO O CLIENTE A ARRAY DE USUARIO */
                usuarios[i].cobranca30.push(cliente)

                /*PRINT DE DEBUB MOSTRANDO A VINVULO ENTRE DEVEDOR E USUARIO*/
                //debug ? console.log(cliente.nome_cli, '<<>>', i, usuarios[i].nome) : 0

                /*SALVANDO NO BANCO DE DADOS DE MANEIRA SICRONA*/
                connectionDB.query(`UPDATE parcelas_vencidas set codusu = "${usuarios[i].codusu}", status_cli= "E" WHERE cod_parc = "${cliente.cod_cli}"; `);
                i = i + 1

                /*CONTROLE DE USUÁRIOS, PARA VOLTAR AO INICIO QUANDO CHEGAR NO ÚLTIMO USUARIO DURANTE O FOR*/
                if (i == totalUsarios) {
                    i = 0
                }

            }

            resultadoFaixa30.resumo = {
                quatidadeClientes: faixa30.length,
                valorTotalClientes: valorfaixa(faixa30)
            }


            debug ? logsSreen(`FAIXA 30 - ${faixa30.length} - ${valorfaixa(faixa30)}`, 'info') : 0
            for (usuario of usuarios) {
                debug ? logsSreen(`USER ${usuario.nome} ficou  com ${usuario.cobranca30.length} clientes total ${valorfaixa(usuario.cobranca30)}`, 'alert'):0


                data = {
                    codusu: usuario.codusu,
                    nome: usuario.nome,
                    total: usuario.cobranca30.length,
                    valor: valorfaixa(usuario.cobranca30)
                }



                resultadoFaixa30.reultado_divisao.push(data)



            }

        }

        /*###################################################################################*/

        if (faixa60.length > 0) {
            /*SORTEANDO FAIXA DE 60 DIAS DE VENCIDOS */
            i = 0
            for (cliente of faixa60) {

                /*ADCIONANDO O CLIENTE A ARRAY DE USUARIO */
                usuarios[i].cobranca60.push(cliente)

                /*PRINT DE DEBUB MOSTRANDO A VINVULO ENTRE DEVEDOR E USUARIO*/
                //debug ? console.log(cliente.nome_cli, '<<>>', i, usuarios[i].nome) : 0

                /*SALVANDO NO BANCO DE DADOS DE MANEIRA SICRONA*/
                connectionDB.query(`UPDATE parcelas_vencidas set codusu = "${usuarios[i].codusu}", status_cli= "E" WHERE cod_parc = "${cliente.cod_cli}"; `);

                /*INCREMENTANDO PARA IR PARA O PRÓXIMO USUARIO*/
                i = i + 1

                /*CONTROLE DE USUÁRIOS, PARA VOLTAR AO INICIO QUANDO CHEGAR NO ÚLTIMO USUARIO DURANTE O FOR*/
                if (i == totalUsarios) {
                    i = 0
                }

            }

            resultadoFaixa60.resumo = {
                quatidadeClientes: faixa60.length,
                valorTotalClientes: valorfaixa(faixa60)
            }


            debug ? logsSreen(`FAIXA 60 - ${faixa60.length} - ${valorfaixa(faixa60)}`, 'info') : 0
            for (usuario of usuarios) {
                debug ? logsSreen(`USER ${usuario.nome} ficou  com ${usuario.cobranca60.length} clientes total ${valorfaixa(usuario.cobranca60)}`, 'alert'):0
                data = {
                    codusu: usuario.codusu,
                    nome: usuario.nome,
                    total: usuario.cobranca60.length,
                    valor: valorfaixa(usuario.cobranca60)
                }



                resultadoFaixa60.reultado_divisao.push(data)


            }



        }


        /*###################################################################################*/


        if (faixa90.length > 0) {
            /*SORTEANDO FAIXA DE 90 DIAS DE VENCIDOS */
            i = 0
            for (cliente of faixa90) {

                /*ADCIONANDO O CLIENTE A ARRAY DE USUARIO */
                usuarios[i].cobranca90.push(cliente)

                /*PRINT DE DEBUB MOSTRANDO A VINVULO ENTRE DEVEDOR E USUARIO*/
                //debug ? console.log(cliente.nome_cli, '<<>>', i, usuarios[i].nome) : 0


                /*SALVANDO NO BANCO DE DADOS DE MANEIRA SICRONA*/
                connectionDB.query(`UPDATE parcelas_vencidas set codusu = "${usuarios[i].codusu}", status_cli= "E" WHERE cod_parc = "${cliente.cod_cli}"; `);

                /*INCREMENTANDO PARA IR PARA O PRÓXIMO USUARIO*/
                i = i + 1

                /*CONTROLE DE USUÁRIOS, PARA VOLTAR AO INICIO QUANDO CHEGAR NO ÚLTIMO USUARIO DURANTE O FOR*/
                if (i == totalUsarios) {
                    i = 0
                }

            }



            resultadoFaixa90.resumo = {
                quatidadeClientes: faixa90.length,
                valorTotalClientes: valorfaixa(faixa90)
            }

            debug ? logsSreen(`FAIXA 90 - ${faixa90.length} - ${valorfaixa(faixa90)}`, 'info') : 0
            for (usuario of usuarios) {
                debug ? logsSreen(`USER ${usuario.nome} ficou  com ${usuario.cobranca90.length} clientes total ${valorfaixa(usuario.cobranca90)}`, 'alert'): 0

                data = {
                    codusu: usuario.codusu,
                    nome: usuario.nome,
                    total: usuario.cobranca90.length,
                    valor: valorfaixa(usuario.cobranca90)
                }

                resultadoFaixa90.reultado_divisao.push(data)
            }



        }


        /*###################################################################################*/


        if (faixa120.length > 0) {
            /*SORTEANDO FAIXA DE 120 DIAS DE VENCIDOS */
            i = 0
            for (cliente of faixa120) {

                /*ADCIONANDO O CLIENTE A ARRAY DE USUARIO */
                usuarios[i].cobranca120.push(cliente)


                /*PRINT DE DEBUB MOSTRANDO A VINVULO ENTRE DEVEDOR E USUARIO*/
                //debug ? console.log(cliente.nome_cli, '<<>>', i, usuarios[i].nome) : 0

                /*SALVANDO NO BANCO DE DADOS DE MANEIRA SICRONA*/
                connectionDB.query(`UPDATE parcelas_vencidas set codusu = "${usuarios[i].codusu}", status_cli= "E" WHERE cod_parc = "${cliente.cod_cli}"; `);

                /*INCREMENTANDO PARA IR PARA O PRÓXIMO USUARIO*/
                i = i + 1

                /*CONTROLE DE USUÁRIOS, PARA VOLTAR AO INICIO QUANDO CHEGAR NO ÚLTIMO USUARIO DURANTE O FOR*/
                if (i == totalUsarios) {
                    i = 0
                }

            }


        resultadoFaixa120.resumo = {
            quatidadeClientes: faixa120.length,
            valorTotalClientes: valorfaixa(faixa120)
        }

        debug ? logsSreen(`FAIXA 120 - ${faixa120.length} - ${valorfaixa(faixa120)}`, 'info') : 0
        for (usuario of usuarios) {
            debug ? logsSreen(`USER ${usuario.nome} ficou  com ${usuario.cobranca120.length} clientes total ${valorfaixa(usuario.cobranca120)}`, 'alert'):0

            data = {
                codusu: usuario.codusu,
                nome: usuario.nome,
                total: usuario.cobranca120.length,
                valor: valorfaixa(usuario.cobranca120)
            }

            resultadoFaixa120.reultado_divisao.push(data)
        }


        }

        if((resultadoFaixa30.resumo.length + resultadoFaixa60.resumo.length + resultadoFaixa90.resumo.length + resultadoFaixa120.resumo.length) == 0){
            return res.status(404).json({
                erro: true,
                message: 'não existe dados para as vaixas'
            })

        }



        /*RETORNO DE SUCESSO*/
        return res.status(200).json({
            erro: false,
            totalUsarios,
            resultadoFaixa30, 
            resultadoFaixa60, 
            resultadoFaixa90, 
            resultadoFaixa120

        })

    },
};