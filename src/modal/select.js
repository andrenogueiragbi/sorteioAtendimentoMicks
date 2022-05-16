module.exports = {
    clienteDevedor:`SELECT 
	SUM(valor_total) as valor ,cod_parc as cod_cli , MAX(faixa_atraso) as faixa_atraso,nome_cli  
FROM parcelas_vencidas pv 
WHERE TRUE 
AND pv.status_cli  = "P" 
GROUP BY cod_parc 
ORDER BY faixa_atraso desc ;
    `,
    
}